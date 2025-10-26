import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';


@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateCategoriaDto) {
    return this.categoriaService.create(body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriaService.delete(Number(id));
  }
}
