import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotosVoluntariado } from './entity/fotos_voluntariado.entity';
import { Voluntariado } from '../voluntariado/entity/voluntariado.entity';
import { FotosVoluntariadoService } from './fotos_voluntariado.service';
import { FotosVoluntariadoController } from './fotos_voluntariado.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([FotosVoluntariado, Voluntariado]),
    CloudinaryModule, 
  ],
  controllers: [FotosVoluntariadoController],
  providers: [FotosVoluntariadoService],
  exports: [FotosVoluntariadoService],
})
export class FotosVoluntariadoModule {}
