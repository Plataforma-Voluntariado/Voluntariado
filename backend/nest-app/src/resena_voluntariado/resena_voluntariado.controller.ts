import { Controller, Post, Get, Body, UseGuards, Param, Req } from '@nestjs/common';
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
  @Post(':voluntariado_id')
  async crearResena(
    @Req() req,
    @Param('voluntariado_id') voluntariado_id: number,
    @Body() dto: CreateResenaVoluntariadoDto
  ) {
    const voluntario_id = req.user.id_usuario;
    return this.resenaVoluntariadoService.crearResena({ ...dto, voluntario_id, voluntariado_id });
  }

  @Get(':id')
  async obtenerResenasPorVoluntariado(@Param('id') id: number) {
    return this.resenaVoluntariadoService.listarResenasPorVoluntariado(id);
  }

}
