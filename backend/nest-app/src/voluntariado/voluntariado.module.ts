import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voluntariado } from './entity/voluntariado.entity';
import { VoluntariadoService } from './voluntariado.service';
import { VoluntariadoController } from './voluntariado.controller';
import { Categoria } from '../categoria/entity/categoria.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voluntariado, Categoria, Usuario]),
  ],
  controllers: [VoluntariadoController],
  providers: [VoluntariadoService],
  exports: [VoluntariadoService],
})
export class VoluntariadoModule {}
