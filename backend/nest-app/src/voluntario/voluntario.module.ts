import { Module } from '@nestjs/common';
import { VoluntarioController } from './voluntario.controller';
import { VoluntarioService } from './voluntario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Voluntario } from './entity/voluntario.entity';
import { EstadisticasVoluntario } from 'src/estadisticas_voluntario/entity/estadisticas_voluntario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voluntario, EstadisticasVoluntario, Usuario])
  ],
  controllers: [VoluntarioController],
  providers: [VoluntarioService],
  exports: [VoluntarioService]
})
export class VoluntarioModule { }
