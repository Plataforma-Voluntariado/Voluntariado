import { Controller, Post, UseInterceptors, UseGuards, Req, UploadedFile, Get, Res, Param, ParseIntPipe, Body, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { VerificacionArchivoService } from './verificacion_archivo.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { RechazarArchivoDto } from './dto/rechazar-archivo.dto';

@Controller('verificacion-archivo')
export class VerificacionArchivoController {
  constructor(
    private readonly verificacionArchivoService: VerificacionArchivoService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('subir/:tipo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(
    @UploadedFile() archivo: Express.Multer.File,
    @Req() req,
    @Param('tipo') tipo: string,
  ) {
    const usuario = req.user;
    return this.verificacionArchivoService.subirArchivo(usuario, archivo, tipo);
  }


  @UseGuards(JwtAuthGuard)
  @Get('ver/:id')
  async verArchivo(@Req() req, @Res() res: Response, @Param('id') id: string) {
    const usuarioActual = req.user;
    const archivoId = parseInt(id);
    const bufferPDF = await this.verificacionArchivoService.obtenerArchivo(usuarioActual, archivoId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(bufferPDF);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Post('aceptar/:id')
  async aceptarArchivo(@Param('id', ParseIntPipe) id: number, @Req() req,) {
    const admin = req.user;
    return this.verificacionArchivoService.aceptarArchivo(id, admin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @Post('rechazar/:id')
  async rechazarArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RechazarArchivoDto,
    @Req() req,
  ) {
    const admin = req.user;
    return this.verificacionArchivoService.rechazarArchivo(id, admin, dto);
  }


}
