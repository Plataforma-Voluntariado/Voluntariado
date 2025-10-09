import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
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
}
