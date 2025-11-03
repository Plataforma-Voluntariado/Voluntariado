import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion } from './entity/verificacion.entity';
import { VerificacionArchivo } from './verificacion_archivo/entity/verificacion-archivo.entity';
import { VerificacionService } from './verificacion.service';
import { VerificacionController } from './verificacion.controller';
import { Creador } from '../creador/entity/creador.entity';
import { UsersGateway } from 'src/usuario/usuario.gateway';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Verificacion,
      VerificacionArchivo, 
      Creador, 
    ]),
    NotificacionesModule
  ],
  controllers: [VerificacionController],
  providers: [VerificacionService, UsersGateway],
  exports:[VerificacionService]
})
export class VerificacionModule {}
