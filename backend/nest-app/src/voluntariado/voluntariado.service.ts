import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario, RolUsuario } from '../usuario/entity/usuario.entity';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';

@Injectable()
export class VoluntariadoService {
  constructor(
    @InjectRepository(Voluntariado)
    private readonly voluntariadoRepository: Repository<Voluntariado>,

    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateVoluntariadoDto, creadorId: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id_categoria: dto.categoria_id },
    });

    if (!categoria) {
      throw new NotFoundException('La categoría no existe.');
    }

    const creador = await this.usuarioRepository.findOne({
      where: { id_usuario: creadorId },
    });

    if (!creador) {
      throw new NotFoundException('El usuario creador no existe.');
    }

    const voluntariado = this.voluntariadoRepository.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      fechaHora: dto.fechaHora,
      horas: dto.horas,
      estado: dto.estado ?? undefined,
      categoria,
      creador,
    });

    return await this.voluntariadoRepository.save(voluntariado);
  }

  async findAllByCreator(creadorId: number) {
    return await this.voluntariadoRepository.find({
      where: { creador: { id_usuario: creadorId } },
      relations: ['categoria', 'creador'],
      order: { fechaHora: 'ASC' },
    });
  }

  async findAll() {
    return await this.voluntariadoRepository.find({
      relations: ['categoria', 'creador'],
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number, user: Usuario) {
    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: id },
      relations: ['categoria', 'creador'],
    });

    if (!voluntariado) {
      throw new NotFoundException('Voluntariado no encontrado.');
    }

    if (user.rol === RolUsuario.CREADOR && voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tiene permiso para ver este voluntariado.');
    }

    return voluntariado;
  }

  async update(id: number, dto: UpdateVoluntariadoDto, user: Usuario) {
    const voluntariado = await this.findOne(id, user);

    if (user.rol === RolUsuario.CREADOR && voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tiene permiso para actualizar este voluntariado.');
    }

    if (dto.categoria_id) {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_categoria: dto.categoria_id },
      });

      if (!categoria) {
        throw new NotFoundException('La categoría no existe.');
      }

      voluntariado.categoria = categoria;
      delete dto.categoria_id;
    }

    if ('creador' in dto) {
      throw new BadRequestException('No está permitido modificar el creador del voluntariado.');
    }

    Object.assign(voluntariado, dto);

    return await this.voluntariadoRepository.save(voluntariado);
  }

  async remove(id: number, user: Usuario) {
    const voluntariado = await this.findOne(id, user);

    if (user.rol === RolUsuario.CREADOR && voluntariado.creador.id_usuario !== user.id_usuario) {
      throw new ForbiddenException('No tiene permiso para eliminar este voluntariado.');
    }

    await this.voluntariadoRepository.remove(voluntariado);

    return {
      message: `El voluntariado "${voluntariado.titulo}" ha sido eliminado exitosamente.`,
    };
  }
}
