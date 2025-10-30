import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async obtenerPorUsuario(@Req() req) {
    const todas = await this.notificacionesService.obtenerPorUsuario(req.user.id_usuario);

    return {
      vistas: todas.filter(n => n.visto),
      noVistas: todas.filter(n => !n.visto),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('marcar-vista/:notificacionId')
  async marcarComoVista(@Req() req, @Param('notificacionId', ParseIntPipe) notificacionId: number,) {
    const userId = req.user.id_usuario;
    return this.notificacionesService.marcarComoVista(userId, notificacionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('eliminar/:notificacionId')
  async eliminarNotificacion(@Req() req,@Param('notificacionId', ParseIntPipe) notificacionId: number,) {
    const userId = req.user.id_usuario;
    return this.notificacionesService.eliminarNotificacion(userId, notificacionId);
  }
}


