import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from './config/constants';
import { UsuarioModule } from './usuario/usuario.module';
import { CiudadModule } from './ciudad/ciudad.module';
import { DepartamentoModule } from './departamento/departamento.module';
import { AuthModule } from './auth/auth.module';
import { CreadorModule } from './creador/creador.module';
import { VoluntarioModule } from './voluntario/voluntario.module';
import { AdministradorModule } from './administrador/administrador.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TokenModule } from './token/token.module';
import { MailModule } from './mail/mail.module';
import { VerificacionModule } from './verificacion/verificacion.module';
import { VerificacionArchivoModule } from './verificacion/verificacion_archivo/verificacion_archivo.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>(DB_HOST),
        port: +(configService.get<number>(DB_PORT) ?? 3306),
        username: configService.get<string>(DB_USER),
        password: configService.get<string>(DB_PASSWORD),
        database: configService.get<string>(DB_DATABASE),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: false, 
      }),
      inject: [ConfigService],
    }),
    UsuarioModule,
    CiudadModule,
    DepartamentoModule,
    AuthModule,
    CreadorModule,
    VoluntarioModule,
    AdministradorModule,
    CloudinaryModule,
    TokenModule,
    MailModule,
    VerificacionModule,
    VerificacionArchivoModule,
    GatewaysModule,
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule { }
