import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Inscripcion, EstadoInscripcion } from './entity/inscripcion.entity';
import { EstadoVoluntariado, Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { RolUsuario, Usuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntarioService } from 'src/estadisticas_voluntario/estadisticas_voluntario.service';

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

        return this.inscripcionRepo.save(inscripcion);
    }

    async aceptarInscripcion(creador: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario) throw new ForbiddenException('Solo el creador puede aceptar');
        if (inscripcion.estado_inscripcion !== EstadoInscripcion.PENDIENTE) throw new BadRequestException('Solo se pueden aceptar inscripciones pendientes');
        if (inscripcion?.voluntariado.estado != EstadoVoluntariado.PENDIENTE) throw new NotFoundException('Solo se puede aceptar inscripciones a voluntariados en estado pendiente');

        await this.validarCupos(inscripcion.voluntariado.id_voluntariado, inscripcion.voluntariado.maxParticipantes);

        inscripcion.estado_inscripcion = EstadoInscripcion.ACEPTADA;
        return this.inscripcionRepo.save(inscripcion);
    }

    async rechazarInscripcion(creador: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.estado_inscripcion === EstadoInscripcion.ACEPTADA) throw new ForbiddenException('No puedes rechazar una inscripcion ya aceptada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario) throw new ForbiddenException('Solo el creador puede rechazar');

        inscripcion.estado_inscripcion = EstadoInscripcion.RECHAZADA;
        return this.inscripcionRepo.save(inscripcion);
    }

    async cancelar(voluntario: Usuario, idInscripcion: number) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.estado_inscripcion === EstadoInscripcion.CANCELADA) throw new NotFoundException('Inscripción ya cancelada');
        if (inscripcion.voluntario.id_usuario !== voluntario.id_usuario) throw new ForbiddenException('No puedes cancelar esta inscripción');

        const ahora = new Date();
        if (inscripcion.voluntariado.fechaHoraInicio <= ahora) throw new BadRequestException('No puedes cancelar después de que el voluntariado empezó');

        inscripcion.estado_inscripcion = EstadoInscripcion.CANCELADA;
        return this.inscripcionRepo.save(inscripcion);
    }

    async misInscripciones(voluntarioId: number) {
        return this.inscripcionRepo.find({
            where: { voluntario: { id_usuario: voluntarioId } },
            relations: ['voluntariado'],
            order: { fecha_inscripcion: 'DESC' },
        });
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
                estado_inscripcion: Not(EstadoInscripcion.CANCELADA),
            },
            relations: ['voluntario'],
            order: { fecha_inscripcion: 'ASC' },
        });

        const agrupadas = {
            pendientes: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.PENDIENTE),
            aceptadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.ACEPTADA),
            rechazadas: inscripciones.filter(i => i.estado_inscripcion === EstadoInscripcion.RECHAZADA),
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

    async marcarAsistencia(creador: Usuario,idInscripcion: number,asistencia: boolean | null,) {
        const inscripcion = await this.inscripcionRepo.findOne({
            where: { id_inscripcion: idInscripcion },
            relations: ['voluntariado', 'voluntariado.creador', 'voluntario'],
        });

        if (!inscripcion) throw new NotFoundException('Inscripción no encontrada');
        if (inscripcion.voluntariado.creador.id_usuario !== creador.id_usuario)
            throw new ForbiddenException('Solo el creador puede marcar la asistencia');
        if (inscripcion.voluntariado.estado !== EstadoVoluntariado.TERMINADO)
            throw new BadRequestException('Solo se puede marcar asistencia a voluntariados terminados');
        if (inscripcion.estado_inscripcion !== EstadoInscripcion.ACEPTADA)
            throw new BadRequestException('Solo se puede marcar asistencia a inscripciones aceptadas');

        if (inscripcion.asistencia !== null) {
            throw new BadRequestException('La asistencia ya fue marcada y no se puede modificar');
        }

        // Marcar asistencia
        inscripcion.asistencia = asistencia;
        await this.inscripcionRepo.save(inscripcion);

        try {
            await this.estadisticasService.actualizarEstadisticasPorAsistencia(
                inscripcion.voluntario.id_usuario,
                inscripcion.voluntariado.id_voluntariado,
            );
        } catch (error) {
            console.error('Error actualizando estadísticas por asistencia:', error);
        }

        return inscripcion;
    }




}
