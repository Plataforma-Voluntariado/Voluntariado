import { Module } from '@nestjs/common';
import { VoluntarioController } from './voluntario.controller';
import { VoluntarioService } from './voluntario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [VoluntarioController],
  providers: [VoluntarioService]
})
export class VoluntarioModule { }
