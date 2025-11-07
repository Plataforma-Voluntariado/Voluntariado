import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EstadisticasVoluntarioService } from './estadisticas_voluntario.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('estadisticas-voluntario')
export class EstadisticasVoluntarioController {
  constructor(private readonly estadisticasService: EstadisticasVoluntarioService) {}

  @Get(':id')
  async obtenerEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.estadisticasService.obtenerEstadisticas(id);
  }
}
