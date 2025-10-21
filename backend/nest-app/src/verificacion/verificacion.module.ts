import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion } from './entity/verificacion.entity';
import { VerificacionArchivo } from './verificacion_archivo/entity/verificacion-archivo.entity';
import { VerificacionService } from './verificacion.service';
import { VerificacionController } from './verificacion.controller';
import { Creador } from '../creador/entity/creador.entity'; // 👈 Importación añadida

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Verificacion,
      VerificacionArchivo, // 👈 Agregado
      Creador, // 👈 Agregado
    ]),
  ],
  controllers: [VerificacionController],
  providers: [VerificacionService],
  exports:[VerificacionService]
})
export class VerificacionModule {}
