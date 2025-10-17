import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SERVER_PORT } from './config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuracion de cors
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Registrar filtro global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Habilitar cookie-parser para JWT en cookies
  app.use(cookieParser());

  // Activa validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // lanza error si vienen propiedades extra
    transform: true,       // transforma automáticamente tipos (string → number, string → Date, etc.)
  }));

  const configService = app.get(ConfigService);

  // server port: convertir string a número con Number()
  const port = Number(configService.get<string>(SERVER_PORT)) || 3000;

  await app.listen(port);
  console.log("Servidor corriendo en http://localhost:" + port);
}

bootstrap();
