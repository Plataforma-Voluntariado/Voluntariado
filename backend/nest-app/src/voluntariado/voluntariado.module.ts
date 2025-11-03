// src/voluntariado/voluntariado.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { VoluntariadoService } from './voluntariado.service';
import { VoluntariadoController } from './voluntariado.controller';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { FotosVoluntariado } from '../fotos_voluntariado/entity/fotos_voluntariado.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Inscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { FotosVoluntariadoModule } from 'src/fotos_voluntariado/fotos_voluntariado.module';
import { UbicacionModule } from 'src/ubicacion/ubicacion.module';
import { VoluntariadoSchedulerService } from './VoluntariadoSchedulerService';
import { VoluntariadoProcessor } from './voluntariado.processor';
import { BullMqModule } from 'src/bull/bull.module';
import { InscripcionModule } from 'src/inscripcion/inscripcion.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voluntariado,
      Categoria,
      Usuario,
      FotosVoluntariado,
      Inscripcion,
    ]),
    CloudinaryModule,
    FotosVoluntariadoModule,
    UbicacionModule,
    forwardRef(() => BullMqModule),
    InscripcionModule
  ],
  controllers: [VoluntariadoController],
  providers: [
    VoluntariadoService,
    VoluntariadoSchedulerService,
    VoluntariadoProcessor
  ],
  exports: [VoluntariadoService, VoluntariadoSchedulerService],
})
export class VoluntariadoModule {}
