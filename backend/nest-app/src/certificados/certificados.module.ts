import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { Certificado } from './entity/certificado.entity';
import { Inscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificado, Inscripcion]),
    CloudinaryModule,
    ConfigModule,
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService],
  exports: [CertificadosService],
})
export class CertificadosModule {}
