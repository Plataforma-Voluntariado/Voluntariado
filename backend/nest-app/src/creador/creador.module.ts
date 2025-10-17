import { Module } from '@nestjs/common';
import { CreadorController } from './creador.controller';
import { CreadorService } from './creador.service';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [CreadorController],
  providers: [CreadorService]
})
export class CreadorModule { }
