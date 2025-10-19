import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EXPIRES_IN, JWT_SECRET } from 'src/config/constants';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtRecoveryStrategy } from './strategies/jwt-recovery.strategy';



@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(JWT_SECRET),
        signOptions: { expiresIn: configService.get<string>(EXPIRES_IN) || '1h'}
      })
    }),
    TypeOrmModule.forFeature([Usuario,Creador,Voluntario,Administrador]),
    UsuarioModule,
    TokenModule,
    MailModule
  ],
  providers: [AuthService, JwtStrategy,JwtRecoveryStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }