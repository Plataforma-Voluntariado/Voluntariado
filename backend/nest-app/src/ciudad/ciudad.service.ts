import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ciudad } from './entity/ciudad.entity';

@Injectable()
export class CiudadService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadRepository: Repository<Ciudad>,
  ) {}

  // Listar todas las ciudades de un departamento
  async listarPorDepartamento(id_departamento: number): Promise<{id_ciudad: number, ciudad: string}[]> {
    const ciudades = await this.ciudadRepository.find({
      where: { departamento: { id_departamento } },
      order: { ciudad: 'ASC' }, // opcional, orden alfabético
    });

    if (!ciudades || ciudades.length === 0) {
      throw new NotFoundException('No se encontraron ciudades para este departamento');
    }

    // Retornar solo los campos necesarios para el frontend
    return ciudades.map(c => ({ id_ciudad: c.id_ciudad, ciudad: c.ciudad }));
  }
}
