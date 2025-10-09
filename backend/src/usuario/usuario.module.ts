import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Usuario } from './entity/usuario.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudad,Voluntario,Administrador,Creador,Usuario]) ,
    CloudinaryModule,
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}

