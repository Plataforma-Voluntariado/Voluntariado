import { Controller, Post, Get, Body } from '@nestjs/common';
import { ComentariosVoluntariadoService } from './comentarios_voluntariado.service';
import { CreateComentarioVoluntariadoDto } from './dto/create-comentario_voluntariado.dto';
@Controller('comentarios-voluntariado')
export class ComentariosVoluntariadoController {
  constructor(private readonly service: ComentariosVoluntariadoService) {}

  @Post()
  async crearComentario(@Body() dto: CreateComentarioVoluntariadoDto) {
    return this.service.crearComentario(dto);
  }

  @Get()
  async listarComentarios() {
    return this.service.listarComentarios();
  }
}
