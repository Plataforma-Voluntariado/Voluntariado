import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CiudadService } from './ciudad.service';

@Controller('ciudades')
export class CiudadController {
  constructor(private readonly ciudadService: CiudadService) {}

  @Get('por-departamento/:id_departamento')
  async obtenerCiudades(
    @Param('id_departamento', ParseIntPipe) id_departamento: number,
  ) {
    return this.ciudadService.listarPorDepartamento(id_departamento);
  }
}
