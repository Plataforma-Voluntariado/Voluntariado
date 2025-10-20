import { Module } from '@nestjs/common';
import { VerificacionController } from './verificacion.controller';
import { VerificacionService } from './verificacion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion } from './entity/verificacion.entity';
import { VerificacionArchivo } from './verificacion_archivo/entity/verificacion-archivo.entity';
import { Creador } from 'src/creador/entity/creador.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario,Verificacion,VerificacionArchivo]),
  ],
  controllers: [VerificacionController],
  providers: [VerificacionService],
  exports:[VerificacionService]
})
export class VerificacionModule { }
