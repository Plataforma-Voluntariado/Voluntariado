import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { CreateResenaVoluntariadoDto } from './dto/create-resena_voluntariado.dto';
import { ResenaVoluntariadoService } from './resena_voluntariado.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resenas-voluntariado')
export class ResenaVoluntariadoController {
  constructor(private readonly resenaVoluntariadoService: ResenaVoluntariadoService) { }

  @Roles(RolUsuario.VOLUNTARIO)
  @Post()
  async crearResena(@Body() dto: CreateResenaVoluntariadoDto) {
    return this.resenaVoluntariadoService.crearResena(dto);
  }

  @Get(':id')
  async obtenerResenasPorVoluntariado(@Param('id') id: number) {
    return this.resenaVoluntariadoService.listarResenasPorVoluntariado(id);
  }

}
