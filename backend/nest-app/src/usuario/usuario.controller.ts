import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { solicitudVerificacionCorreoDto } from './dto/solicitud-verificacion-correo.dto';
import { VerificacionCorreoDto } from './dto/validar-codigo-verificacion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { validarImagen } from './helpers/image.helper';


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
  async solicitarRecuperacion(@Body() solicitudVerificacionCorreoDto: solicitudVerificacionCorreoDto) {
    return this.usuarioService.solicitarVerificacionCorreo(solicitudVerificacionCorreoDto);
  }

  @Post('verificacion-correo')
  @UseGuards(JwtAuthGuard)
  async verificacionCorreo(@Req() req, @Body() verificacionCorreodto: VerificacionCorreoDto) {
    const userId = req.user.id_usuario;
    return this.usuarioService.validarCodigoVerificacionCorreo(verificacionCorreodto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('imagen-perfil')
  @UseInterceptors(FileInterceptor('imagen'))
  async actualizarImagenPerfil(@UploadedFile() file: Express.Multer.File, @Req() req,) {
    validarImagen(file);
    const userId = req.user.id_usuario
    return this.usuarioService.actualizarImagenPerfil(userId, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('imagen-perfil')
  async eliminarImagenPerfil(@Req() req) {
    const userId = req.user.id_usuario;
    return this.usuarioService.eliminarImagenPerfil(userId);
  }


}
