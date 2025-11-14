import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entity/inscripcion.entity';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntarioModule } from 'src/estadisticas_voluntario/estadisticas_voluntario.module';
import { NotificacionesModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion, Voluntariado, Usuario]),
    EstadisticasVoluntarioModule,
  // Importar el módulo de notificaciones para poder crear y enviar notificaciones
  NotificacionesModule,
  ],
  controllers: [InscripcionController],
  providers: [InscripcionService],
  exports: [InscripcionService],
})
export class InscripcionModule {}
