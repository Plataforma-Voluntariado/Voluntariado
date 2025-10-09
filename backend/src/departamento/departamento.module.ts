import { Module } from '@nestjs/common';
import { DepartamentoController } from './departamento.controller';
import { DepartamentoService } from './departamento.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudad])
  ],
  controllers: [DepartamentoController],
  providers: [DepartamentoService]
})
export class DepartamentoModule { }
