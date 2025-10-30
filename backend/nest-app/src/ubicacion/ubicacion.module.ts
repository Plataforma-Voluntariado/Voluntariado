import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ubicacion } from './entity/ubicacion.entity';
import { Voluntariado } from './../voluntariado/entity/voluntariado.entity';
import { Ciudad } from './../ciudad/entity/ciudad.entity';
import { UbicacionService } from './ubicacion.service';
import { UbicacionController } from './ubicacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ubicacion, Voluntariado, Ciudad])],
  controllers: [UbicacionController],
  providers: [UbicacionService],
  exports: [UbicacionService],
})
export class UbicacionModule { }
