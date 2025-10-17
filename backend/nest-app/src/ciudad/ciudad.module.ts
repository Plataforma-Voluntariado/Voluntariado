import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CiudadController } from './ciudad.controller';
import { CiudadService } from './ciudad.service';
import { Ciudad } from './entity/ciudad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ciudad])], // ✅ aquí va Ciudad
  controllers: [CiudadController],
  providers: [CiudadService],
  exports: [TypeOrmModule], // ✅ permite que otros módulos usen el repo
})
export class CiudadModule {}

