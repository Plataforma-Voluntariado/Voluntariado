import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './entity/departamento.entity';

@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  // Obtener todos los departamentos
  async obtenerTodos(): Promise<{ id_departamento: number; departamento: string }[]> {
    const departamentos = await this.departamentoRepository.find({
      order: { departamento: 'ASC' }, // Ordenar alfabéticamente (opcional)
    });

    // Devolvemos solo los campos que necesita el frontend
    return departamentos.map((d) => ({
      id_departamento: d.id_departamento,
      departamento: d.departamento,
    }));
  }
}
