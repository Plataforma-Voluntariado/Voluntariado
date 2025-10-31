import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ubicacion } from './entity/ubicacion.entity';
import { Ciudad } from './../ciudad/entity/ciudad.entity';
import { UbicacionService } from './ubicacion.service';



@Module({
  imports: [TypeOrmModule.forFeature([Ubicacion,Ciudad])],
  controllers: [],
  providers: [UbicacionService],
  exports: [UbicacionService],
})
export class UbicacionModule { }
