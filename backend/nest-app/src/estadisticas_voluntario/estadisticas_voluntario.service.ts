import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadisticasVoluntario } from './entity/estadisticas_voluntario.entity';
import { RolUsuario } from 'src/usuario/entity/usuario.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';

@Injectable()
export class EstadisticasVoluntarioService {
  constructor(
    @InjectRepository(EstadisticasVoluntario)
    private readonly estadisticasRepo: Repository<EstadisticasVoluntario>,

    @InjectRepository(Voluntario)
    private readonly voluntarioRepo: Repository<Voluntario>,

    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,
  ) { }


  async crearEstadisticasSiNoExisten(voluntario_id: number) {
    const voluntario = await this.voluntarioRepo.findOne({
      where: { id_usuario: voluntario_id },
      relations: ['usuario', 'estadisticas'],
    });

    if (!voluntario || voluntario.usuario.rol !== RolUsuario.VOLUNTARIO) {
      throw new NotFoundException('El usuario no es un voluntario o no existe.');
    }

    if (voluntario.estadisticas) return voluntario.estadisticas;

    const estadisticas = this.estadisticasRepo.create({
      voluntario,
      horas_trabajadas: 0,
      participaciones: 0,
      porcentaje_asistencia: 0,
    });

    return this.estadisticasRepo.save(estadisticas);
  }


  async actualizarEstadisticasPorAsistencia(voluntario_id: number, voluntariado_id: number) {
    try {
      const inscripcion = await this.inscripcionRepo.findOne({
        where: {
          voluntario: { id_usuario: voluntario_id },
          voluntariado: { id_voluntariado: voluntariado_id },
        },
      });

      if (!inscripcion) {
        console.error('Inscripción no encontrada', { voluntario_id, voluntariado_id });
        throw new NotFoundException('Inscripción no encontrada.');
      }

      if (inscripcion.asistencia === null) return null;

      const estadisticas = await this.crearEstadisticasSiNoExisten(voluntario_id);

      const resumen = await this.inscripcionRepo
        .createQueryBuilder('i')
        .leftJoin('i.voluntariado', 'v')
        .where('i.voluntario_id = :voluntario_id', { voluntario_id }) // <-- corregido
        .andWhere('i.estado_inscripcion = :estado', { estado: EstadoInscripcion.ACEPTADA })
        .select('COUNT(i.id_inscripcion)', 'totalInscripciones')
        .addSelect('SUM(CASE WHEN i.asistencia = true THEN 1 ELSE 0 END)', 'totalAsistencias')
        .addSelect('SUM(CASE WHEN i.asistencia = true AND i.calificado = true THEN v.horas ELSE 0 END)', 'horasTrabajadas')
        .addSelect('SUM(CASE WHEN i.asistencia = true AND i.calificado = true THEN 1 ELSE 0 END)', 'participaciones')
        .getRawOne();

      const totalInscripciones = parseInt(resumen.totalInscripciones, 10);
      const totalAsistencias = parseInt(resumen.totalAsistencias, 10);
      const horasTrabajadas = parseInt(resumen.horasTrabajadas, 10) || 0;
      const participaciones = parseInt(resumen.participaciones, 10) || 0;

      const actualizarHorasYParticipaciones = inscripcion.asistencia === true && inscripcion.calificado;
      if (actualizarHorasYParticipaciones) {
        estadisticas.horas_trabajadas = horasTrabajadas;
        estadisticas.participaciones = participaciones;
      }

      if (inscripcion.asistencia === false || actualizarHorasYParticipaciones) {
        estadisticas.porcentaje_asistencia = totalInscripciones
          ? Math.round((totalAsistencias / totalInscripciones) * 100)
          : 0;
      }

      return await this.estadisticasRepo.save(estadisticas);

    } catch (error) {
      console.error('Error actualizando estadísticas por asistencia:', error);
      throw error;
    }
  }


  async obtenerEstadisticas(voluntario_id: number) {
    const estadisticas = await this.estadisticasRepo.findOne({
      where: { voluntario: { id_usuario: voluntario_id } },
      relations: ['voluntario', 'voluntario.usuario'],
    });

    if (!estadisticas) {
      throw new NotFoundException('No se encontraron estadísticas para este voluntario.');
    }

    return estadisticas;
  }
}
