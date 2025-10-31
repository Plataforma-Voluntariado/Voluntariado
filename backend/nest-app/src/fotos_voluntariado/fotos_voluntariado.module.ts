import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotosVoluntariado } from './entity/fotos_voluntariado.entity';
import { Voluntariado } from '../voluntariado/entity/voluntariado.entity';

import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 
import { FotosVoluntariadoService } from './fotos_voluntariado.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FotosVoluntariado, Voluntariado]),
    CloudinaryModule, 
  ],
  controllers: [],
  providers: [FotosVoluntariadoService],
  exports: [FotosVoluntariadoService],
})
export class FotosVoluntariadoModule {}
