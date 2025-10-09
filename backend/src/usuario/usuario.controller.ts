import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    await this.usuarioService.create(createUsuarioDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuario creado exitosamente',
    };
  }
}
