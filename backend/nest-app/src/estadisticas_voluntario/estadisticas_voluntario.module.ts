import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadisticasVoluntarioController } from './estadisticas_voluntario.controller';
import { EstadisticasVoluntarioService } from './estadisticas_voluntario.service';
import { EstadisticasVoluntario } from './entity/estadisticas_voluntario.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Inscripcion } from 'src/inscripcion/entity/inscripcion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EstadisticasVoluntario,
      Usuario,
      Voluntariado,
      Inscripcion,
    ]),
  ],
  controllers: [EstadisticasVoluntarioController],
  providers: [EstadisticasVoluntarioService],
  exports: [EstadisticasVoluntarioService],
})
export class EstadisticasVoluntarioModule {}
