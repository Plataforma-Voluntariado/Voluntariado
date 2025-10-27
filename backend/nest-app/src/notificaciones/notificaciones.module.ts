import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { Notificacion } from './entity/notificacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { NotificacionesGateway } from './notificaciones.gateway';

@Module({
  imports: [
      TypeOrmModule.forFeature([Notificacion,Usuario]) ,
    ],
  providers: [NotificacionesService,NotificacionesGateway],
  controllers: [NotificacionesController],
  exports:[NotificacionesService]
})
export class NotificacionesModule {}
