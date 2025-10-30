import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './entity/ubicacion.entity';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { Voluntariado } from './../voluntariado/entity/voluntariado.entity';
import { Ciudad } from './../ciudad/entity/ciudad.entity';

@Injectable()
export class UbicacionService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepository: Repository<Ubicacion>,
    @InjectRepository(Voluntariado)
    private readonly voluntariadoRepository: Repository<Voluntariado>,
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) { }

  async create(createUbicacionDto: CreateUbicacionDto) {
    const { voluntariado_id, ciudad_id, ...rest } = createUbicacionDto;

    const voluntariado = await this.voluntariadoRepository.findOne({
      where: { id_voluntariado: voluntariado_id },
    });
    if (!voluntariado)
      throw new NotFoundException('Voluntariado no encontrado.');

    const ciudad = await this.ciudadRepository.findOne({
      where: { id_ciudad: ciudad_id },
    });
    if (!ciudad) throw new NotFoundException('Ciudad no encontrada.');

    const ubicacion = this.ubicacionRepository.create({
      ...rest,
      voluntariado,
      ciudad,
    });

    return this.ubicacionRepository.save(ubicacion);
  }

  async findAll() {
    return this.ubicacionRepository.find({
      relations: ['voluntariado', 'ciudad'],
    });
  }

  async findOne(id: number) {
    const ubicacion = await this.ubicacionRepository.findOne({
      where: { id_ubicacion: id },
      relations: ['voluntariado', 'ciudad'],
    });
    if (!ubicacion) throw new NotFoundException('Ubicación no encontrada.');
    return ubicacion;
  }

  async update(id: number, updateUbicacionDto: UpdateUbicacionDto) {
    const ubicacion = await this.ubicacionRepository.findOne({
      where: { id_ubicacion: id },
    });
    if (!ubicacion) throw new NotFoundException('Ubicación no encontrada.');

    Object.assign(ubicacion, updateUbicacionDto);
    return this.ubicacionRepository.save(ubicacion);
  }

  async remove(id: number) {
    const ubicacion = await this.ubicacionRepository.findOne({
      where: { id_ubicacion: id },
    });
    if (!ubicacion) throw new NotFoundException('Ubicación no encontrada.');

    return this.ubicacionRepository.remove(ubicacion);
  }
}
