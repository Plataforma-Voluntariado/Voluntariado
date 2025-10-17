import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartamentoController } from './departamento.controller';
import { DepartamentoService } from './departamento.service';
import { Departamento } from './entity/departamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departamento])], // ✅ aquí va Departamento
  controllers: [DepartamentoController],
  providers: [DepartamentoService],
  exports: [TypeOrmModule], // ✅ igual para exportar el repo
})
export class DepartamentoModule {}
