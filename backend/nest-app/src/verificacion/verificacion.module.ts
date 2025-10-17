import { Module } from '@nestjs/common';
import { VerificacionController } from './verificacion.controller';
import { VerificacionService } from './verificacion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { VerificacionArchivoModule } from 'src/verificacion/verificacion_archivo/verificacion_archivo.module';
import { Verificacion } from './entity/verificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario,Verificacion]),
    VerificacionArchivoModule
  ],
  controllers: [VerificacionController],
  providers: [VerificacionService]
})
export class VerificacionModule { }
