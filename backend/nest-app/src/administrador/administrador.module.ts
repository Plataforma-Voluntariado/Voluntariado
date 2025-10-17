import { Module } from '@nestjs/common';
import { AdministradorController } from './administrador.controller';
import { AdministradorService } from './administrador.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario, Verificacion])
    ],
    controllers: [AdministradorController],
    providers: [AdministradorService]
})
export class AdministradorModule {

}
