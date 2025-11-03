import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entity/inscripcion.entity';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Inscripcion, Voluntariado,Usuario]),
    ],
    controllers: [InscripcionController],
    providers: [InscripcionService],
    exports: [],
})
export class InscripcionModule { }
