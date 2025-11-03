import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { EstadisticasVoluntario } from './entity/estadisticas_voluntario.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';

@Injectable()
export class EstadisticasVoluntarioService {
    constructor(
        @InjectRepository(EstadisticasVoluntario)
        private readonly estadisticasRepo: Repository<EstadisticasVoluntario>,

        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,

        @InjectRepository(Inscripcion)
        private readonly inscripcionRepo: Repository<Inscripcion>,

        @InjectRepository(Voluntariado)
        private readonly voluntariadoRepo: Repository<Voluntariado>,
    ) { }

    // Crear estadísticas base para un voluntario si no existen
    async crearEstadisticasSiNoExisten(voluntario_id: number) {
        const voluntario = await this.usuarioRepo.findOne({
            where: { id_usuario: voluntario_id },
        });

        if (!voluntario)
            throw new NotFoundException('Voluntario no encontrado.');

        if (voluntario.rol !== RolUsuario.VOLUNTARIO)
            throw new NotFoundException('El usuario no es un voluntario.');

        let estadisticas = await this.estadisticasRepo.findOne({
            where: { voluntario: { id_usuario: voluntario_id } },
        });

        if (!estadisticas) {
            estadisticas = this.estadisticasRepo.create({
                voluntario,
                horas_trabajadas: 0,
                participaciones: 0,
                porcentaje_asistencia: 0,
            });
            await this.estadisticasRepo.save(estadisticas);
        }

        return estadisticas;
    }

    async actualizarEstadisticasPorAsistencia(
        voluntario_id: number,
        voluntariado_id: number,
        asistencia: boolean,
    ) {
        const estadisticas = await this.crearEstadisticasSiNoExisten(voluntario_id);

        const voluntariado = await this.voluntariadoRepo.findOne({
            where: { id_voluntariado: voluntariado_id },
        });

        if (!voluntariado)
            throw new NotFoundException('Voluntariado no encontrado.');

        // Solo sumar horas y participaciones si asistió
        if (asistencia) {
            estadisticas.horas_trabajadas += voluntariado.horas || 0;
            estadisticas.participaciones += 1;
        }

        // Calcular el total de inscripciones aceptadas
        const totalInscripciones = await this.inscripcionRepo.count({
            where: {
                voluntario: { id_usuario: voluntario_id },
                estado_inscripcion: EstadoInscripcion.ACEPTADA,
            },
        });

        // Calcular las asistencias verdaderas
        const totalAsistencias = await this.inscripcionRepo.count({
            where: {
                voluntario: { id_usuario: voluntario_id },
                asistencia: true,
                estado_inscripcion: EstadoInscripcion.ACEPTADA,
            },
        });

        // Actualizar el porcentaje
        estadisticas.porcentaje_asistencia = totalInscripciones
            ? Math.round((totalAsistencias / totalInscripciones) * 100)
            : 0;

        return this.estadisticasRepo.save(estadisticas);
    }


    // Obtener estadísticas de un voluntario
    async obtenerEstadisticas(voluntario_id: number) {
        const estadisticas = await this.estadisticasRepo.findOne({
            where: { voluntario: { id_usuario: voluntario_id } },
            relations: ['voluntario'],
        });

        if (!estadisticas)
            throw new NotFoundException('No se encontraron estadísticas para este voluntario.');

        return estadisticas;
    }
}
