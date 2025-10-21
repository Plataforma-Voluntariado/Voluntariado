import { Module } from '@nestjs/common';
import { VerificacionArchivoService } from './verificacion_archivo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificacionArchivo } from './entity/verificacion-archivo.entity';
import { Verificacion } from '../entity/verificacion.entity';
import { VerificacionArchivoController } from './verificacion_archivo.controller';
import { ConfigModule } from '@nestjs/config';
import { VerificacionModule } from '../verificacion.module';
import { Usuario } from 'src/usuario/entity/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario,VerificacionArchivo,Verificacion]),
    ConfigModule,
    VerificacionModule
  ],
  controllers:[VerificacionArchivoController],
  providers: [VerificacionArchivoService],
  exports: [VerificacionArchivoService]
})
export class VerificacionArchivoModule { }
