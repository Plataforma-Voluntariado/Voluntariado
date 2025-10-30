import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario, RolUsuario } from '../usuario/entity/usuario.entity';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { Ubicacion } from '../ubicacion/entity/ubicacion.entity';
import { Ciudad } from '../ciudad/entity/ciudad.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FotosVoluntariado } from '../fotos_voluntariado/entity/fotos_voluntariado.entity';

@Injectable()
export class VoluntariadoService {
  constructor(
    @InjectRepository(Voluntariado)
    private readonly voluntariadoRepository: Repository<Voluntariado>,

    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Ubicacion)
    private readonly ubicacionRepository: Repository<Ubicacion>,

    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,

    @InjectRepository(FotosVoluntariado)
    private readonly fotosRepository: Repository<FotosVoluntariado>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly dataSource: DataSource,
  ) { }

  /**
   * Crear voluntariado con ubicación y fotos (todo en una transacción)
   */
  async create(
    dto: CreateVoluntariadoDto,
    creadorId: number,
    files?: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️ Validar categoría
      const categoria = await queryRunner.manager.findOne(Categoria, {
        where: { id_categoria: dto.categoria_id },
      });
      if (!categoria)
        throw new NotFoundException('La categoría especificada no existe.');

      // 2️ Validar creador
      const creador = await queryRunner.manager.findOne(Usuario, {
        where: { id_usuario: creadorId },
      });
      if (!creador)
        throw new NotFoundException('El usuario creador no existe.');

      // 3️ Crear voluntariado base
      const voluntariado = queryRunner.manager.create(Voluntariado, {
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion.trim(),
        fechaHora: dto.fechaHora,
        horas: dto.horas,
        estado: dto.estado ?? undefined,
        categoria,
        creador,
      });
      await queryRunner.manager.save(voluntariado);

      // 4️ Crear ubicación (si viene en el DTO)
      if (dto.ubicacion) {
        const { ciudad_id, latitud, longitud, direccion, nombre_sector } =
          dto.ubicacion;

        const ciudad = await queryRunner.manager.findOne(Ciudad, {
          where: { id_ciudad: ciudad_id },
        });
        if (!ciudad)
          throw new NotFoundException('La ciudad indicada no existe.');

        const ubicacion = queryRunner.manager.create(Ubicacion, {
          ciudad,
          latitud,
          longitud,
          direccion: direccion?.trim(),
          nombre_sector: nombre_sector?.trim(),
          voluntariado,
        });

        await queryRunner.manager.save(Ubicacion, ubicacion);
        voluntariado.ubicacion = ubicacion;
      }

      // 5️ Subir fotos (si hay archivos)
      if (files && files.length > 0) {
        const fotosGuardadas: FotosVoluntariado[] = [];

        for (const file of files) {
          try {
            const uploadResult = await this.cloudinaryService.uploadImage(
              file,
              'fotos-voluntariado',
            );

            const nuevaFoto = queryRunner.manager.create(FotosVoluntariado, {
              url: uploadResult.secure_url,
              voluntariado,
            });

            await queryRunner.manager.save(FotosVoluntariado, nuevaFoto);
            fotosGuardadas.push(nuevaFoto);
          } catch (uploadError) {
            console.error('Error subiendo imagen a Cloudinary:', uploadError);
            throw new BadRequestException(
              'Error al subir una de las imágenes. Verifique el formato.',
            );
          }
        }

        voluntariado.fotos = fotosGuardadas;
      }

      await queryRunner.commitTransaction();

      // 6️ Retornar voluntariado con todas sus relaciones
      const voluntariadoCompleto = await this.voluntariadoRepository.findOne({
        where: { id_voluntariado: voluntariado.id_voluntariado },
        relations: ['categoria', 'creador', 'ubicacion', 'fotos'],
      });

      return {
        message: ' Voluntariado creado exitosamente con ubicación y fotos.',
        voluntariado: voluntariadoCompleto,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(' Error creando voluntariado:', error);
      throw new BadRequestException(
        error.message || 'Error al crear el voluntariado.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtener todos los voluntariados
   */
  findAll() {
    return this.voluntariadoRepository.find({
      relations: ['creador', 'categoria', 'fotos', 'ubicacion'],
      order: { id_voluntariado: 'DESC' },
    });
  }

  /**
   * Obtener los voluntariados creados por un usuario específico
   */
  findAllByCreator(idUsuario: number) {
    return this.voluntariadoRepository.find({
      where: { creador: { id_usuario: idUsuario } },
      relations: ['creador', 'categoria', 'fotos', 'ubicacion'],
      order: { id_voluntariado: 'DESC' },
    });
  }

  /**
   * Obtener un voluntariado por ID
   */
  async findOne(id: number, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);

    if (
      user.rol === RolUsuario.CREADOR &&
      voluntariado.creador.id_usuario !== user.id_usuario
    ) {
      throw new ForbiddenException(
        'No tiene permiso para ver este voluntariado.',
      );
    }

    return voluntariado;
  }

  /**
   * Actualizar voluntariado
   */
  async update(id: number, dto: UpdateVoluntariadoDto, user: Usuario) {
    const voluntariado = await this.findVoluntariadoById(id);

    if (
      user.rol === RolUsuario.CREADOR &&
      voluntariado.creador.id_usuario !== user.id_usuario
    ) {
      throw new ForbiddenException(
        'No tiene permiso para actualizar este voluntariado.',
      );
    }

    if (dto.categoria_id) {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_categoria: dto.categoria_id },
      });
      if (!categoria)
        throw new NotFoundException('La categoría indicada no existe.');
      voluntariado.categoria = categoria;
      delete dto.categoria_id;
    }

    Object.assign(voluntariado, dto);
    return await this.voluntariadoRepository.save(voluntariado);
  }

  /**
   * Buscar voluntariado (uso interno)
   */
  private async findVoluntariadoById(id: number) {
    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: id },
      relations: ['categoria', 'creador', 'fotos', 'ubicacion', 'ubicacion.ciudad'],
    });

    if (!voluntariado)
      throw new NotFoundException('Voluntariado no encontrado.');

    return voluntariado;
  }

  /**
 * Eliminar voluntariado (borra fotos en Cloudinary también)
 */
  async remove(id: number, user: Usuario) {
    const voluntariado = await this.findOne(id, user);

    if (
      user.rol === RolUsuario.CREADOR &&
      voluntariado.creador.id_usuario !== user.id_usuario
    ) {
      throw new ForbiddenException(
        'No tiene permiso para eliminar este voluntariado.',
      );
    }

    // 🔹 Eliminar fotos de Cloudinary antes de borrar el voluntariado
    if (voluntariado.fotos && voluntariado.fotos.length > 0) {
      for (const foto of voluntariado.fotos) {
        if (foto.url.includes('res.cloudinary.com')) {
          const publicId = this.extractPublicIdFromUrl(foto.url);
          if (publicId) {
            try {
              await this.cloudinaryService.deleteImage(publicId);
            } catch (err) {
              console.warn(
                `⚠️ No se pudo eliminar la imagen ${publicId} de Cloudinary.`,
              );
            }
          }
        }
      }
    }

    // 🔹 Eliminar voluntariado (borra fotos y ubicación en BD)
    await this.voluntariadoRepository.remove(voluntariado);

    return {
      message: `El voluntariado "${voluntariado.titulo}" ha sido eliminado exitosamente.`,
    };
  }

  /**
   * Extraer el public_id de una URL de Cloudinary
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
