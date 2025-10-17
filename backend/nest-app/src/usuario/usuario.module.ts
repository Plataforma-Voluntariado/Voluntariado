import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Usuario } from './entity/usuario.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Token } from 'src/token/entity/token.entity';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ciudad,Voluntario,Administrador,Creador,Usuario,Token,Verificacion]) ,
    CloudinaryModule,
    TokenModule,
    MailModule
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}

