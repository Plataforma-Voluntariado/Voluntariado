// src/voluntariado/voluntariado.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VoluntariadoService } from './voluntariado.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor('voluntariado')
export class VoluntariadoProcessor extends WorkerHost {
  private readonly logger = new Logger(VoluntariadoProcessor.name);

  constructor(private readonly voluntariadoService: VoluntariadoService) {
    super(); 
  }

  async process(job: Job<{ idVoluntariado: number; estado: string }>) {
    const { idVoluntariado, estado } = job.data;
    try {
      await this.voluntariadoService.updateEstado(idVoluntariado, estado as any);
      this.logger.log(`Voluntariado ${idVoluntariado} actualizado a estado ${estado}`);
    } catch (err) {
      this.logger.error(`Error actualizando voluntariado ${idVoluntariado}: ${err.message}`);
      throw err;
    }
  }
}