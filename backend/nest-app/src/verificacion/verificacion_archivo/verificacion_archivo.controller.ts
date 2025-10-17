import { Controller, Post, UseInterceptors, UseGuards, Req, UploadedFile, Get, Res, Param, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { VerificacionArchivoService } from './verificacion_archivo.service';

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
    res.setHeader('Content-Disposition', 'inline'); // se muestra en navegador, no descarga
    res.send(bufferPDF);
  }
}
