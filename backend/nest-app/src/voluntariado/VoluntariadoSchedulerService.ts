// src/voluntariado/voluntariado-scheduler.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VoluntariadoService } from './voluntariado.service';
import { EstadoVoluntariado } from './entity/voluntariado.entity';

@Injectable()
export class VoluntariadoSchedulerService {
  constructor(
    @InjectQueue('voluntariado') private readonly voluntariadoQueue: Queue,
    @Inject(forwardRef(() => VoluntariadoService))
    private readonly voluntariadoService: VoluntariadoService,
  ) { }

  async scheduleVoluntariado(idVoluntariado: number, fechaInicio: Date, fechaFin: Date) {
    const now = Date.now();

    const delayInicio = Math.max(fechaInicio.getTime() - now, 0);
    const delayFin = Math.max(fechaFin.getTime() - now, 0);

    await this.voluntariadoQueue.add(
      `start-${idVoluntariado}`,
      { idVoluntariado, estado: EstadoVoluntariado.EN_PROCESO },
      { delay: delayInicio, removeOnComplete: true, removeOnFail: true },
    );

    await this.voluntariadoQueue.add(
      `end-${idVoluntariado}`,
      { idVoluntariado, estado: EstadoVoluntariado.TERMINADO },
      { delay: delayFin, removeOnComplete: true, removeOnFail: true },
    );
  }
}