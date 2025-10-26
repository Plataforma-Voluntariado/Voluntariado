import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { VerificacionService } from './verificacion.service';

@Controller('verificacion')
export class VerificacionController {
  constructor(private readonly verificacionService: VerificacionService) { }

  // Listar verificaciones pendientes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Get('pendientes')
  async obtenerVerificacionesPendientes() {
    return this.verificacionService.obtenerVerificacionesPendientes();
  }

  // Archivos pendientes de una verificación específica
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Get('archivos-pendientes/:id')
  async obtenerArchivosPendientesPorVerificacion(@Param('id') id: string) {
    return this.verificacionService.obtenerArchivosPendientesPorVerificacion(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-archivos')
  async obtenerMisUltimosArchivos(@Req() req) {
    const userId = req.user.id_usuario; 
  
    const archivos = await this.verificacionService.obtenerUltimosArchivosPorUsuario(userId);

    return { archivos };
  }
}