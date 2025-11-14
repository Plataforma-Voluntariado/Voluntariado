import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from './entity/inscripcion.entity';
import { EstadoVoluntariado, Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { RolUsuario, Usuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntarioService } from 'src/estadisticas_voluntario/estadisticas_voluntario.service';
import { NotificacionesService } from 'src/notificaciones/notificaciones.service';
import { TipoNotificacion } from 'src/notificaciones/entity/notificacion.entity';

@Injectable()
export class InscripcionService {
    constructor(
        @InjectRepository(Inscripcion)
        private inscripcionRepo: Repository<Inscripcion>,
        @InjectRepository(Voluntariado)
        private voluntariadoRepo: Repository<Voluntariado>,
        @InjectRepository(Usuario)
        private usuarioRepo: Repository<Usuario>,
        private readonly estadisticasService: EstadisticasVoluntarioService,
        private eventEmitter: EventEmitter2,
        private readonly notificacionesService: NotificacionesService,
    ) { }

    private async validarCupos(voluntariadoId: number, max: number) {
        const aceptados = await this.inscripcionRepo.count({
            where: {
                voluntariado: { id_voluntariado: voluntariadoId },
                estado_inscripcion: EstadoInscripcion.ACEPTADA,
            },
        });

        if (aceptados >= max) throw new BadRequestException('No hay cupos disponibles');
    }

    async inscribirse(voluntarioId: number, voluntariadoId: number) {
        const [voluntario, voluntariado] = await Promise.all([
            this.usuarioRepo.findOne({ where: { id_usuario: voluntarioId } }),
            this.voluntariadoRepo.findOne({
                where: { id_voluntariado: voluntariadoId },
                relations: ['creador'],
            }),
        ]);

        if (!voluntario) throw new NotFoundException('Usuario no encontrado');
        if (!voluntariado) throw new NotFoundException('Voluntariado no encontrado');
        if (!voluntario.verificado) throw new BadRequestException('Tu cuenta debe estar verificada para inscribirte a voluntariados.');
        if (voluntario.rol !== RolUsuario.VOLUNTARIO) throw new ForbiddenException('Solo los voluntarios pueden inscribirse a voluntariados');
        if (voluntariado?.estado != EstadoVoluntariado.PENDIENTE) throw new NotFoundException('Solo se puede inscribir a un voluntariado en estado pendiente');

        const inscripcionPrev = await this.inscripcionRepo.findOne({
            where: { voluntario, voluntariado },
            order: { id_inscripcion: 'DESC' },
        });


        if (inscripcionPrev) {
            switch (inscripcionPrev.estado_inscripcion) {
                case EstadoInscripcion.RECHAZADA:
                    throw new ForbiddenException('No puedes reinscribirte, fuiste rechazado');
                case EstadoInscripcion.PENDIENTE:
                    throw new BadRequestException('Ya tienes una inscripción pendiente');
                case EstadoInscripcion.ACEPTADA:
                    throw new BadRequestException('Ya estás inscrito y aceptado');
            }
        }

        await this.validarCupos(voluntariado.id_voluntariado, voluntariado.maxParticipantes);

        const inscripcion = this.inscripcionRepo.create({
            voluntario,
            voluntariado,
            estado_inscripcion: EstadoInscripcion.PENDIENTE,
        });

        const saved = await this.inscripcionRepo.save(inscripcion);
        try {
            this.eventEmitter.emit('inscripcion.created', {
                type: 'created',
                inscripcion: saved,
                voluntariadoId: saved.voluntariado?.id_voluntariado,
                userId: saved.voluntario?.id_usuario,
            });
        } catch (e) {
            console.error('Event emit error inscripcion.created', e);
        }

        // Crear y enviar notificación al creador del voluntariado
        try {
            const creadorId = saved.voluntariado?.creador?.id_usuario;
            const nombreVoluntario = `${saved.voluntario?.nombre || ''} ${saved.voluntario?.apellido || ''}`.trim();
            if (creadorId) {
                await this.notificacionesService.crearYEnviarNotificacion([creadorId], {
                    tipo: TipoNotificacion.INFO,
                    titulo: 'Nueva inscripción',
                    mensaje: `${nombreVoluntario || 'Un usuario'} se ha inscrito a ${saved.voluntariado?.titulo || 'tu voluntariado'}`,
                    referencia_id: saved.id_inscripcion,
                    url_redireccion: `/manage-events/${saved.voluntariado?.id_voluntariado}`,
                });
            }
        } catch (e) {
            console.error('Error creando notificación inscripcion.created', e);
        }

        return saved;
    }

    async aceptarInscripcion(creador: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario) throw new ForbiddenException('Solo el creador puede aceptar');
        if (inscripcion.estado_inscripcion !== EstadoInscripcion.PENDIENTE) throw new BadRequestException('Solo se pueden aceptar inscripciones pendientes');
        if (inscripcion?.voluntariado.estado != EstadoVoluntariado.PENDIENTE) throw new NotFoundException('Solo se puede aceptar inscripciones a voluntariados en estado pendiente');

        await this.validarCupos(inscripcion.voluntariado.id_voluntariado, inscripcion.voluntariado.maxParticipantes);

        inscripcion.estado_inscripcion = EstadoInscripcion.ACEPTADA;
        const saved = await this.inscripcionRepo.save(inscripcion);
        try {
            this.eventEmitter.emit('inscripcion.updated', {
                type: 'aceptada',
                inscripcion: saved,
                voluntariadoId: saved.voluntariado?.id_voluntariado,
                userId: saved.voluntario?.id_usuario,
            });
        } catch (e) {
            console.error('Event emit error inscripcion.updated', e);
        }
        // Notificar al voluntario sobre la aceptación
        try {
            const voluntarioId = saved.voluntario?.id_usuario;
            if (voluntarioId) {
                await this.notificacionesService.crearYEnviarNotificacion([voluntarioId], {
                    tipo: TipoNotificacion.INFO,
                    titulo: 'Inscripción aceptada',
                    mensaje: `Tu inscripción al voluntariado ${saved.voluntariado?.titulo || ''} ha sido aceptada.`,
                    referencia_id: saved.id_inscripcion,
                    url_redireccion: `/manage-inscripciones`,
                });
            }
        } catch (e) {
            console.error('Error creando notificación inscripcion.aceptada', e);
        }
        return saved;
    }

    async rechazarInscripcion(creador: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.estado_inscripcion === EstadoInscripcion.ACEPTADA) throw new ForbiddenException('No puedes rechazar una inscripcion ya aceptada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario) throw new ForbiddenException('Solo el creador puede rechazar');
        if (inscripcion?.voluntariado.estado != EstadoVoluntariado.PENDIENTE) throw new NotFoundException('Solo se puede rechazar inscripciones a voluntariados en estado pendiente');

        inscripcion.estado_inscripcion = EstadoInscripcion.RECHAZADA;
        const saved = await this.inscripcionRepo.save(inscripcion);
        try {
            this.eventEmitter.emit('inscripcion.updated', {
                type: 'rechazada',
                inscripcion: saved,
                voluntariadoId: saved.voluntariado?.id_voluntariado,
                userId: saved.voluntario?.id_usuario,
            });
        } catch (e) {
            console.error('Event emit error inscripcion.updated', e);
        }
        // Notificar al voluntario sobre la rechaz
        try {
            const voluntarioId = saved.voluntario?.id_usuario;
            if (voluntarioId) {
                await this.notificacionesService.crearYEnviarNotificacion([voluntarioId], {
                    tipo: TipoNotificacion.ALERTA,
                    titulo: 'Inscripción rechazada',
                    mensaje: `Tu inscripción al voluntariado ${saved.voluntariado?.titulo || ''} ha sido rechazada.`,
                    referencia_id: saved.id_inscripcion,
                    url_redireccion: `/manage-inscripciones`,
                });
            }
        } catch (e) {
            console.error('Error creando notificación inscripcion.rechazada', e);
        }
        return saved;
    }

    async cancelar(voluntario: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.estado_inscripcion === EstadoInscripcion.CANCELADA) throw new NotFoundException('Inscripción ya cancelada');
        if (inscripcion.voluntario.id_usuario !== voluntario.id_usuario) throw new ForbiddenException('No puedes cancelar esta inscripción');
        if (inscripcion.voluntariado.estado === EstadoVoluntariado.TERMINADO) throw new BadRequestException('No puedes cancelar un voluntariado que ya terminó');
        if (inscripcion.voluntariado.estado === EstadoVoluntariado.EN_PROCESO) throw new BadRequestException('No puedes cancelar un voluntariado que ya esta en proceso');
        const ahora = new Date();
        if (inscripcion.voluntariado.fechaHoraInicio <= ahora) throw new BadRequestException('No puedes cancelar después de que el voluntariado empezó');

        inscripcion.estado_inscripcion = EstadoInscripcion.CANCELADA;
        const saved = await this.inscripcionRepo.save(inscripcion);
        try {
            this.eventEmitter.emit('inscripcion.updated', {
                type: 'cancelada',
                inscripcion: saved,
                voluntariadoId: saved.voluntariado?.id_voluntariado,
                userId: saved.voluntario?.id_usuario,
            });
        } catch (e) {
            console.error('Event emit error inscripcion.updated', e);
        }
        // Notificar al creador que un voluntario canceló
        try {
            const creadorId = saved.voluntariado?.creador?.id_usuario;
            const nombreVoluntario = `${saved.voluntario?.nombre || ''} ${saved.voluntario?.apellido || ''}`.trim();
            if (creadorId) {
                await this.notificacionesService.crearYEnviarNotificacion([creadorId], {
                    tipo: TipoNotificacion.INFO,
                    titulo: 'Inscripción cancelada',
                    mensaje: `${nombreVoluntario || 'Un usuario'} ha cancelado su inscripción en ${saved.voluntariado?.titulo || ''}.`,
                    referencia_id: saved.id_inscripcion,
                    url_redireccion: `/manage-events/${saved.voluntariado?.id_voluntariado}`,
                });
            }
        } catch (e) {
            console.error('Error creando notificación inscripcion.cancelada', e);
        }
        return saved;
    }

    async misInscripciones(voluntarioId: number) {
        const inscripciones = await this.inscripcionRepo.find({
            where: { voluntario: { id_usuario: voluntarioId } },
            relations: ['voluntariado', 'voluntariado.creador', 'voluntariado.categoria', 'voluntariado.fotos'],
            order: { fecha_inscripcion: 'DESC' },
        });

        const agrupadas = {
            pendientes: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.PENDIENTE),
            aceptadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.ACEPTADA),
            rechazadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.RECHAZADA),
            canceladas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.CANCELADA),
            terminadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.TERMINADA),
        };

        return agrupadas;
    }


    async inscripcionesDeVoluntariado(creador: Usuario, voluntariadoId: number) {
        const voluntariado = await this.voluntariadoRepo.findOne({
            where: { id_voluntariado: voluntariadoId },
            relations: ['creador'],
        });

        if (!voluntariado) throw new NotFoundException('Voluntariado no encontrado');
        if (voluntariado.creador.id_usuario !== creador.id_usuario) throw new ForbiddenException('No puedes ver inscripciones de este voluntariado');

        const inscripciones = await this.inscripcionRepo.find({
            where: {
                voluntariado: { id_voluntariado: voluntariadoId },
            },
            relations: ['voluntario'],
            order: { fecha_inscripcion: 'ASC' },
        });

        const agrupadas = {
            pendientes: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.PENDIENTE),
            aceptadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.ACEPTADA),
            rechazadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.RECHAZADA),
            terminadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.TERMINADA),
            canceladas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.CANCELADA),
        };

        return agrupadas;
    }

    async rechazarPendientesPorVoluntariado(idVoluntariado: number) {
        await this.inscripcionRepo
            .createQueryBuilder()
            .update(Inscripcion)
            .set({ estado_inscripcion: EstadoInscripcion.RECHAZADA })
            .where('voluntariado_id = :id', { id: idVoluntariado })
            .andWhere('estado_inscripcion = :pendiente', { pendiente: EstadoInscripcion.PENDIENTE })
            .execute();
    }

    async marcarAsistencia(creador: Usuario, idInscripcion: number, asistencia: boolean | null,) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario)
            throw new ForbiddenException('Solo el creador puede marcar la asistencia');
        if (inscripcion.voluntariado.estado !== EstadoVoluntariado.TERMINADO)
            throw new BadRequestException('Solo se puede marcar asistencia a voluntariados terminados');
        if (inscripcion.estado_inscripcion !== EstadoInscripcion.TERMINADA)
            throw new BadRequestException('Solo se puede marcar asistencia a inscripciones aceptadas');

        if (inscripcion.asistencia !== null) {
            throw new BadRequestException('La asistencia ya fue marcada y no se puede modificar');
        }

        inscripcion.asistencia = asistencia;
        const saved = await this.inscripcionRepo.save(inscripcion);

        try {
            await this.estadisticasService.actualizarEstadisticasPorAsistencia(
                inscripcion.voluntario.id_usuario,
                inscripcion.voluntariado.id_voluntariado,
            );
        } catch (error) {
            console.error('Error actualizando estadísticas por asistencia:', error);
        }

        try {
            this.eventEmitter.emit('inscripcion.asistencia_marked', {
                type: 'asistencia_marked',
                inscripcion: saved,
                voluntariadoId: saved.voluntariado?.id_voluntariado,
                userId: saved.voluntario?.id_usuario,
                asistencia,
            });
        } catch (e) {
            console.error('Event emit error inscripcion.asistencia_marked', e);
        }

        // Notificar al voluntario que su asistencia fue marcada
        try {
            const voluntarioId = saved.voluntario?.id_usuario;
            if (voluntarioId) {
                await this.notificacionesService.crearYEnviarNotificacion([voluntarioId], {
                    tipo: TipoNotificacion.INFO,
                    titulo: 'Asistencia registrada',
                    mensaje: `Se registró tu asistencia en el voluntariado ${saved.voluntariado?.titulo || ''}.`,
                    referencia_id: saved.id_inscripcion,
                    url_redireccion: `/manage-inscripciones`,
                });
            }
        } catch (e) {
            console.error('Error creando notificación inscripcion.asistencia_marked', e);
        }

        return saved;
    }

    async marcarTerminadasPorVoluntariado(voluntariadoId: number) {
        await this.inscripcionRepo
            .createQueryBuilder()
            .update('inscripcion')
            .set({ estado_inscripcion: EstadoInscripcion.TERMINADA })
            .where('voluntariado_id = :id AND estado_inscripcion = :estado', {
                id: voluntariadoId,
                estado: EstadoInscripcion.ACEPTADA,
            })
            .execute();
    }

    async cancelarTodasPorVoluntariado(idVoluntariado: number) {
        await this.inscripcionRepo
            .createQueryBuilder()
            .update(Inscripcion)
            .set({ estado_inscripcion: EstadoInscripcion.CANCELADA })
            .where('voluntariado_id = :id', { id: idVoluntariado })
            .execute();
    }

}
