import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FotosVoluntariadoService } from './fotos_voluntariado.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { CreateFotoVoluntariadoDto } from './dto/create-foto-voluntariado.dto';

@Controller('fotos-voluntariado')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FotosVoluntariadoController {
  constructor(
    private readonly fotosVoluntariadoService: FotosVoluntariadoService,
  ) {}

  /**
   * Subir una foto a un voluntariado
   * Solo los creadores pueden hacerlo
   */
  @Roles(RolUsuario.CREADOR)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async agregarFoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateFotoVoluntariadoDto,
    @Req() req: any,
  ) {
    return this.fotosVoluntariadoService.agregarFoto(dto, file, req.user);
  }

  /**
   * Eliminar una foto (solo el creador del voluntariado)
   */
  @Roles(RolUsuario.CREADOR)
  @Delete(':id_foto')
  async eliminarFoto(@Param('id_foto') id_foto: string, @Req() req: any) {
    return this.fotosVoluntariadoService.eliminarFoto(+id_foto, req.user);
  }

  /**
   * Listar todas las fotos de un voluntariado
   * Accesible para todos los roles
   */
  @Get('voluntariado/:voluntariado_id')
  async listarPorVoluntariado(
    @Param('voluntariado_id') voluntariado_id: string,
  ) {
    return this.fotosVoluntariadoService.listarPorVoluntariado(
      +voluntariado_id,
    );
  }
}
