import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { VoluntariadoService } from './voluntariado.service';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('voluntariados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariadoController {
  constructor(private readonly voluntariadoService: VoluntariadoService) { }

  /**
   * ✅ Crea un voluntariado con ubicación y múltiples fotos.
   * Usa CloudinaryService internamente para subir las imágenes.
   */
  @Roles(RolUsuario.CREADOR)
  @Post()
  @UseInterceptors(
    FilesInterceptor('fotos', 10, {
      storage: memoryStorage(), // ✅ Permite usar file.buffer (necesario para Cloudinary)
      limits: {
        fileSize: 5 * 1024 * 1024, // Máx 5MB por imagen
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateVoluntariadoDto,
    @Req() req: any,
    @UploadedFiles() fotos: Express.Multer.File[],
  ) {
    return this.voluntariadoService.create(dto, req.user.id_usuario, fotos);
  }

  @Get()
  findAll() {
    return this.voluntariadoService.findAll();
  }

  @Roles(RolUsuario.CREADOR)
  @Get('owns')
  findMine(@Req() req: any) {
    return this.voluntariadoService.findAllByCreator(req.user.id_usuario);
  }

  @Roles(RolUsuario.CREADOR, RolUsuario.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.findOne(+id, req.user);
  }

  @Roles(RolUsuario.CREADOR)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVoluntariadoDto,
    @Req() req: any,
  ) {
    return this.voluntariadoService.update(+id, dto, req.user);
  }

  @Roles(RolUsuario.CREADOR, RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.remove(+id, req.user);
  }
}
