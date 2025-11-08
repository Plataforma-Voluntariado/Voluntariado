import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResenaVoluntariado } from './entity/resenas_voluntariado.entity';
import { Inscripcion } from '../inscripcion/entity/inscripcion.entity';
import { Voluntariado } from '../voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntario } from 'src/estadisticas_voluntario/entity/estadisticas_voluntario.entity';
import { ResenaVoluntariadoController } from './resena_voluntariado.controller';
import { ResenaVoluntariadoService } from './resena_voluntariado.service';
import { EstadisticasVoluntarioModule } from 'src/estadisticas_voluntario/estadisticas_voluntario.module';


@Module({
  imports: [TypeOrmModule.forFeature([ResenaVoluntariado, Inscripcion, Voluntariado, Usuario,EstadisticasVoluntario]),
  EstadisticasVoluntarioModule
],
  controllers: [ResenaVoluntariadoController],
  providers: [ResenaVoluntariadoService],
})
export class ResenaVoluntariadoModule {}
