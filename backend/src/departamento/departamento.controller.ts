import { Controller, Get } from '@nestjs/common';
import { DepartamentoService } from './departamento.service';

@Controller('departamentos')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @Get()
  async obtenerDepartamentos() {
    return this.departamentoService.obtenerTodos();
  }
}
