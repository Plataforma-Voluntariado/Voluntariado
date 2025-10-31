import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entity/inscripcion.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Inscripcion]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class InscripcionModule { }
