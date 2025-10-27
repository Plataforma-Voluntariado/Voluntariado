import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { VoluntariadoService } from './voluntariado.service';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';

@Controller('voluntariados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariadoController {
  constructor(private readonly voluntariadoService: VoluntariadoService) { }

  @Roles(RolUsuario.CREADOR)
  @Post()
  create(@Body() dto: CreateVoluntariadoDto, @Req() req: any) {
    return this.voluntariadoService.create(dto, req.user.id_usuario);
  }

  @Get()
  findAll() {
    return this.voluntariadoService.findAll();
  }

  @Roles(RolUsuario.CREADOR)
  @Get('owns')
  findMine(@Req() req: any) {
    return this.voluntariadoService.findAllByCreator(req.user.id_usuario);
  }


  @Roles(RolUsuario.CREADOR, RolUsuario.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.findOne(+id, req.user);
  }

  @Roles(RolUsuario.CREADOR)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVoluntariadoDto, @Req() req: any) {
    return this.voluntariadoService.update(+id, dto, req.user);
  }


  @Roles(RolUsuario.CREADOR, RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.remove(+id, req.user);
  }
}
