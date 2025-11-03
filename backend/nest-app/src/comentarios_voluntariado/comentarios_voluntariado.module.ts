import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosVoluntariado } from './entity/comentarios_voluntariado.entity';
import { ComentariosVoluntariadoService } from './comentarios_voluntariado.service';
import { ComentariosVoluntariadoController } from './comentarios_voluntariado.controller';
import { Inscripcion } from '../inscripcion/entity/inscripcion.entity';
import { Voluntariado } from '../voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntario } from 'src/estadisticas_voluntario/entity/estadisticas_voluntario.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ComentariosVoluntariado, Inscripcion, Voluntariado, Usuario,EstadisticasVoluntario])],
  controllers: [ComentariosVoluntariadoController],
  providers: [ComentariosVoluntariadoService],
})
export class ComentariosVoluntariadoModule {}
