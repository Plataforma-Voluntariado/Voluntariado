import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards, Put, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { VoluntariadoService } from './voluntariado.service';
import { CreateVoluntariadoDto } from './dto/create-voluntariado.dto';
import { UpdateVoluntariadoDto } from './dto/update-voluntariado.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

const ImageInterceptor = (field: string) =>
  FilesInterceptor(field, 10, {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
        return cb(
          new BadRequestException('Solo se permiten imágenes (jpg, jpeg, png, webp).'),
          false
        );
      }
      cb(null, true);
    },
  });

@Controller('voluntariados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoluntariadoController {
  constructor(private readonly voluntariadoService: VoluntariadoService) { }

  private parseJsonField(field: any, errorMsg: string) {
    if (field && typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        throw new BadRequestException(errorMsg);
      }
    }
    return field;
  }

  @Roles(RolUsuario.CREADOR)
  @Post()
  @UseInterceptors(ImageInterceptor('fotos'))
  async create(@Body() body: any, @Req() req: any, @UploadedFiles() fotos: Express.Multer.File[]) {

    body.ubicacion = this.parseJsonField(body.ubicacion, 'Formato inválido para ubicacion');

    if (!fotos || fotos.length < 1) {
      throw new BadRequestException('Debe subir al menos 1 imagen.');
    }
    const dto = plainToInstance(CreateVoluntariadoDto, body);

    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    return this.voluntariadoService.create(dto, req.user.id_usuario, fotos);
  }

  @Roles(RolUsuario.CREADOR)
  @Put(':id')
  @UseInterceptors(ImageInterceptor('nuevasFotos'))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFiles() nuevasFotos: Express.Multer.File[], @Req() req: any) {
    body.ubicacion = this.parseJsonField(body.ubicacion, 'Formato inválido para ubicacion');
    body.fotosMantener = this.parseJsonField(body.fotosMantener, 'fotosMantener debe ser un arreglo válido. Ej: [1,2,3]');

    if (body.fotosMantener && !Array.isArray(body.fotosMantener)) {
      body.fotosMantener = [body.fotosMantener];
    }

    const dto = plainToInstance(UpdateVoluntariadoDto, body);

    try {
      await validateOrReject(dto);
    } catch (errors) {
      throw new BadRequestException(errors);
    }
    
    return this.voluntariadoService.update(+id, dto, req.user.id_usuario, nuevasFotos);
  }

  @Roles(RolUsuario.CREADOR, RolUsuario.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.remove(+id, req.user);
  }

  @Roles(RolUsuario.CREADOR)
  @Get('owns')
  findMine(@Req() req: any) {
    return this.voluntariadoService.findAllByCreator(req.user.id_usuario);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.voluntariadoService.findOne(+id, req.user);
  }

  @Get()
  findAll() {
    return this.voluntariadoService.findAll();
  }
}
