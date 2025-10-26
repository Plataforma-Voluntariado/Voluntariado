import { Module } from '@nestjs/common';
import { VoluntariadoService } from './voluntariado.service';
import { VoluntariadoController } from './voluntariado.controller';

@Module({
  providers: [VoluntariadoService],
  controllers: [VoluntariadoController]
})
export class VoluntariadoModule {}
