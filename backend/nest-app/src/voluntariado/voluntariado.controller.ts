import { Controller, Get, Post, Body, Param, Patch, Delete, Req } from '@nestjs/common';
import { VoluntariadoService } from './voluntariado.service';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';


@Controller('voluntariados')
export class VoluntariadoController {
  constructor(private readonly voluntariadoService: VoluntariadoService) {}

  @Post()
  create(@Body() dto: CreateVoluntariadoDto, @Req() req: any) {
    const usuarioId = req.user?.id_usuario ?? 1;
    return this.voluntariadoService.create(dto, usuarioId);
  }

  @Get()
  findAll() {
    return this.voluntariadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voluntariadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVoluntariadoDto) {
    return this.voluntariadoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voluntariadoService.remove(+id);
  }
}
