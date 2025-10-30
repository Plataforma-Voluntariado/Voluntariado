import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { VoluntariadoService } from './voluntariado.service';
import { VoluntariadoController } from './voluntariado.controller';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { Ubicacion } from '../ubicacion/entity/ubicacion.entity';
import { Ciudad } from '../ciudad/entity/ciudad.entity';
import { FotosVoluntariado } from '../fotos_voluntariado/entity/fotos_voluntariado.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voluntariado,
      Categoria,
      Usuario,
      Ubicacion,
      Ciudad,
      FotosVoluntariado,
    ]),
    CloudinaryModule,
  ],
  controllers: [VoluntariadoController],
  providers: [VoluntariadoService],
  exports: [VoluntariadoService],
})
export class VoluntariadoModule { }
