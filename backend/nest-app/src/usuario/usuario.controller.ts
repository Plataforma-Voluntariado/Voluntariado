import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { solicitudVerificacionCorreoDto } from './dto/solicitud-verificacion-correo.dto';
import { VerificacionCorreoDto } from './dto/validar-codigo-verificacion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    await this.usuarioService.create(createUsuarioDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Usuario creado exitosamente',
    };
  }

  @Post('solicitud-verificacion-correo')
  @UseGuards(JwtAuthGuard)
  async solicitarRecuperacion(@Body() solicitudVerificacionCorreoDto:solicitudVerificacionCorreoDto) {
    return this.usuarioService.solicitarVerificacionCorreo(solicitudVerificacionCorreoDto);
  }

  @Post('verificacion-correo')
  @UseGuards(JwtAuthGuard)
  async verificacionCorreo(@Body() verificacionCorreodto: VerificacionCorreoDto) {
    return this.usuarioService.validarCodigoVerificacionCorreo(verificacionCorreodto);
  }
}
