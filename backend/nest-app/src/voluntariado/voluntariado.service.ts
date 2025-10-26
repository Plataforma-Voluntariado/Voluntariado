import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
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
      estado: dto.estado ?? undefined, // opcional
      categoria,
      creador,
    });

    return await this.voluntariadoRepository.save(voluntariado);
  }

  async findAll() {
    return await this.voluntariadoRepository.find({
      relations: ['categoria', 'creador'],
      order: { fechaHora: 'ASC' },
    });
  }

  async findOne(id: number) {
    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: id },
      relations: ['categoria', 'creador'],
    });

    if (!voluntariado) {
      throw new NotFoundException('Voluntariado no encontrado.');
    }

    return voluntariado;
  }

  async update(id: number, dto: UpdateVoluntariadoDto) {
    const voluntariado = await this.findOne(id);

    // Si desea actualizar categoría
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

    // Asegurar que no se pueda cambiar el creador
    if ('creador' in dto) {
      throw new BadRequestException('No está permitido modificar el creador del voluntariado.');
    }

    Object.assign(voluntariado, dto);

    return await this.voluntariadoRepository.save(voluntariado);
  }

  async remove(id: number) {
    const voluntariado = await this.findOne(id);
    return await this.voluntariadoRepository.remove(voluntariado);
  }
}
