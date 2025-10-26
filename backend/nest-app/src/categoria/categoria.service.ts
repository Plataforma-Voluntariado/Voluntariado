import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entity/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
    if (!categoria) {
      throw new NotFoundException(`La categoría con ID ${id} no existe`);
    }
    return categoria;
  }

  async create(data: CreateCategoriaDto): Promise<Categoria> {
    const categoria = this.categoriaRepository.create(data);
    return this.categoriaRepository.save(categoria);
  }


  async delete(id: number): Promise<void> {
    const result = await this.categoriaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No se pudo eliminar, la categoría con ID ${id} no existe`);
    }
  }
}
