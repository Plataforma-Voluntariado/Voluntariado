import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtRecoveryGuard } from './guards/jwt-recovery.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() inicioSesionDto: InicioSesionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const usuario = await this.authService.validateUser(inicioSesionDto);
    const { access_token, user } = await this.authService.login(usuario);

    // Guardar JWT en cookie segura
    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 h
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Inicio de sesión exitoso',
      user,
    };
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  getPerfil(@Req() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // Limpiar la cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Sesión cerrada exitosamente',
    };
  }

  @Post('recuperar')
  async solicitarRecuperacion(@Body() ForgotPasswordDto: ForgotPasswordDto) {
    return this.authService.solicitarRecuperacion(ForgotPasswordDto);
  }

  @Post('restablecer')
  @UseGuards(JwtRecoveryGuard)
  async restablecerContrasena(
    @Request() { user }: any,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.restablecerContrasena(dto, user.sub);
  }

}
