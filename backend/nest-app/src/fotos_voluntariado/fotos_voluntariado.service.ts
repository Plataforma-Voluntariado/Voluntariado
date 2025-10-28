import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FotosVoluntariado } from './entity/fotos_voluntariado.entity';
import { Voluntariado } from '../voluntariado/entity/voluntariado.entity';
import { Usuario, RolUsuario } from '../usuario/entity/usuario.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFotoVoluntariadoDto } from './dto/create-foto-voluntariado.dto';

@Injectable()
export class FotosVoluntariadoService {
  constructor(
    @InjectRepository(FotosVoluntariado)
    private readonly fotosRepository: Repository<FotosVoluntariado>,

    @InjectRepository(Voluntariado)
    private readonly voluntariadoRepository: Repository<Voluntariado>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Subir una foto a Cloudinary y asociarla a un voluntariado
   */
  async agregarFoto(
    dto: CreateFotoVoluntariadoDto,
    file: Express.Multer.File,
    user: Usuario,
  ) {
    if (user.rol !== RolUsuario.CREADOR) {
      throw new ForbiddenException(
        'Solo los creadores pueden agregar fotos a los voluntariados.',
      );
    }

    if (!file) {
      throw new BadRequestException('Debe proporcionar una imagen.');
    }

    // Buscar el voluntariado
    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: dto.voluntariado_id },
      relations: ['creador'],
    });

    if (!voluntariado) {
      throw new NotFoundException('El voluntariado no existe.');
    }

    // Validar propiedad
    if (voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException(
        'No tiene permiso para agregar fotos a este voluntariado.',
      );
    }

    // Subir imagen a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      'fotos-voluntariado',
    );

    const nuevaFoto = this.fotosRepository.create({
      url: uploadResult.secure_url,
      voluntariado,
    });

    await this.fotosRepository.save(nuevaFoto);

    return {
      message: 'Foto subida exitosamente.',
      foto: nuevaFoto,
    };
  }

  /**
   * Eliminar una foto (de BD y Cloudinary)
   */
  async eliminarFoto(id_foto: number, user: Usuario) {
    const foto = await this.fotosRepository.findOne({
      where: { id_foto },
      relations: ['voluntariado', 'voluntariado.creador'],
    });

    if (!foto) {
      throw new NotFoundException('La foto no existe.');
    }

    if (user.rol !== RolUsuario.CREADOR) {
      throw new ForbiddenException(
        'Solo los creadores pueden eliminar fotos de voluntariados.',
      );
    }

    if (foto.voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException(
        'No tiene permiso para eliminar esta foto.',
      );
    }

    // Si la imagen está en Cloudinary, eliminarla
    if (foto.url.includes('res.cloudinary.com')) {
      const publicId = this.extractPublicIdFromUrl(foto.url);
      if (publicId) {
        try {
          await this.cloudinaryService.deleteImage(publicId);
        } catch {
          throw new BadRequestException(
            'No se pudo eliminar la imagen de Cloudinary.',
          );
        }
      }
    }

    await this.fotosRepository.remove(foto);

    return { message: 'Foto eliminada exitosamente.' };
  }

  /**
   * Listar fotos por voluntariado
   */
  async listarPorVoluntariado(voluntariado_id: number) {
    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: voluntariado_id },
    });

    if (!voluntariado) {
      throw new NotFoundException('El voluntariado no existe.');
    }

    return this.fotosRepository.find({
      where: { voluntariado: { id_voluntariado: voluntariado_id } },
    });
  }

  /**
   * Extraer el public_id desde una URL de Cloudinary
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((p) => p === 'upload');
      if (uploadIndex === -1) return null;

      const publicPathParts = parts.slice(uploadIndex + 1);
      if (/^v\d+$/.test(publicPathParts[0])) publicPathParts.shift();

      const publicIdPath = publicPathParts.join('/').replace(/\.[^/.]+$/, '');
      return publicIdPath || null;
    } catch {
      return null;
    }
  }
}
