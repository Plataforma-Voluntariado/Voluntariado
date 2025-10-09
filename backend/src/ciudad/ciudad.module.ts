import { Module } from '@nestjs/common';
import { CiudadController } from './ciudad.controller';
import { CiudadService } from './ciudad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [CiudadController],
  providers: [CiudadService]
})
export class CiudadModule { }
