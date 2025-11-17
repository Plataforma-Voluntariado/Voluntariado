import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { CertificadosService } from './certificados.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('certificados')
export class CertificadosController {
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Genera un certificado para una inscripción específica
   * POST /certificados/generar/:inscripcionId
   */
  @Post('generar/:inscripcionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.VOLUNTARIO)
  @HttpCode(HttpStatus.CREATED)
  async generarCertificado(
    @Param('inscripcionId', ParseIntPipe) inscripcionId: number,
    @Request() req,
  ) {
    const usuarioId = req.user.id_usuario;
    return await this.certificadosService.generarCertificado(inscripcionId, usuarioId);
  }

  /**
   * Obtiene todos los certificados del voluntario autenticado
   * GET /certificados/mis-certificados
   */
  @Get('mis-certificados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.VOLUNTARIO)
  async obtenerMisCertificados(@Request() req) {
    const usuarioId = req.user.id_usuario;
    return await this.certificadosService.obtenerCertificadosVoluntario(usuarioId);
  }

  /**
   * Obtiene las inscripciones elegibles para certificado
   * GET /certificados/elegibles
   */
  @Get('elegibles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.VOLUNTARIO)
  async obtenerInscripcionesElegibles(@Request() req) {
    const usuarioId = req.user.id_usuario;
    return await this.certificadosService.obtenerInscripcionesElegibles(usuarioId);
  }

  /**
   * Verifica un certificado por su hash (endpoint público)
   * GET /certificados/verificar/:hash
   */
  @Get('verificar/:hash')
  @HttpCode(HttpStatus.OK)
  async verificarCertificado(@Param('hash') hash: string, @Res() res: Response) {
    const data = await this.certificadosService.verificarCertificado(hash);
    if (!data?.valido || !data?.certificado?.voluntariado_id) {
      return res.status(404).send({ valido: false, mensaje: 'Certificado no válido o voluntariado no encontrado' });
    }

    const frontendBase = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const baseUrl = frontendBase.startsWith('http') ? frontendBase : `http://${frontendBase}`;
    const target = `${baseUrl}/voluntariado/${data.certificado.voluntariado_id}`;
    return res.redirect(target);
  }
}
