import { Injectable, BadRequestException, ForbiddenException, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResenaVoluntariado } from './entity/resenas_voluntariado.entity';
import { CreateResenaVoluntariadoDto } from './dto/create-resena_voluntariado.dto';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { EstadisticasVoluntario } from 'src/estadisticas_voluntario/entity/estadisticas_voluntario.entity';

@Injectable()
export class ResenaVoluntariadoService {
  constructor(
    @InjectRepository(ResenaVoluntariado)
    private resenaRepo: Repository<ResenaVoluntariado>,

    @InjectRepository(Voluntariado)
    private voluntariadoRepo: Repository<Voluntariado>,

    @InjectRepository(Inscripcion)
    private inscripcionRepo: Repository<Inscripcion>,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,

    @InjectRepository(EstadisticasVoluntario)
    private estadisticasRepo: Repository<EstadisticasVoluntario>,
  ) { }

  async crearResena(dto: CreateResenaVoluntariadoDto) {
    const { voluntario_id, voluntariado_id, comentario } = dto;

    // Buscar voluntario
    const voluntario = await this.usuarioRepo.findOne({ where: { id_usuario: voluntario_id } });
    if (!voluntario) throw new NotFoundException('Voluntario no encontrado');
    if (voluntario.rol !== RolUsuario.VOLUNTARIO)
      throw new ForbiddenException('Solo los voluntarios pueden dejar reseñas.');

    // Buscar voluntariado
    const voluntariado = await this.voluntariadoRepo.findOne({
      where: { id_voluntariado: voluntariado_id },
      relations: ['creador'],
    });
    if (!voluntariado) throw new NotFoundException('Voluntariado no encontrado');
    if (voluntariado.estado !== 'terminado')
      throw new BadRequestException('Solo se pueden reseñar voluntariados terminados.');

    // Verificar inscripción válida y asistencia
    const inscripcion = await this.inscripcionRepo.findOne({
      where: {
        voluntario: { id_usuario: voluntario_id },
        voluntariado: { id_voluntariado: voluntariado.id_voluntariado },
        estado_inscripcion: EstadoInscripcion.ACEPTADA,
      },
    });
    if (!inscripcion)
      throw new ForbiddenException('No puedes reseñar este voluntariado, no estás inscrito.');
    if (!inscripcion.asistencia)
      throw new ForbiddenException('Solo puedes reseñar si asististe al voluntariado.');

    // Verificar reseña previa
    const resenaExistente = await this.resenaRepo.findOne({
      where: {
        voluntario: { id_usuario: voluntario_id },
        voluntariado: { id_voluntariado: voluntariado.id_voluntariado },
      },
    });
    if (resenaExistente)
      throw new BadRequestException('Ya has dejado una reseña para este voluntariado.');

    // -------------------------------
    // Aquí deberías llamar a tu API de sentimiento
    // por ejemplo:
    // const { calificacion, sentimiento } = await procesarResena(comentario);
    // -------------------------------

    // Crear la reseña
    const nuevaResena = this.resenaRepo.create({
      voluntario,
      voluntariado,
      comentario,
      // calificacion, // se agregaría según la API de sentimiento
    });
    const guardado = await this.resenaRepo.save(nuevaResena);

    // Marcar inscripción como calificada
    inscripcion.calificado = true;
    await this.inscripcionRepo.save(inscripcion);

    // Actualizar estadísticas del voluntario
    let estadisticas = await this.estadisticasRepo.findOne({
      where: { voluntario: { id_usuario: voluntario.id_usuario } },
      relations: ['voluntario'],
    });

    if (!estadisticas) {
      estadisticas = this.estadisticasRepo.create({
        voluntario,
        horas_trabajadas: voluntariado.horas || 0,
        participaciones: 1,
        porcentaje_asistencia: 100,
      });
    } else {
      estadisticas.horas_trabajadas += voluntariado.horas || 0;
      estadisticas.participaciones += 1;

      const totalInscripciones = await this.inscripcionRepo.count({
        where: {
          voluntario: { id_usuario: voluntario.id_usuario },
          estado_inscripcion: EstadoInscripcion.ACEPTADA,
        },
      });
      const totalAsistencias = await this.inscripcionRepo.count({
        where: {
          voluntario: { id_usuario: voluntario.id_usuario },
          asistencia: true,
          estado_inscripcion: EstadoInscripcion.ACEPTADA,
        },
      });
      estadisticas.porcentaje_asistencia = totalInscripciones
        ? Math.round((totalAsistencias / totalInscripciones) * 100)
        : 0;
    }

    await this.estadisticasRepo.save(estadisticas);

    return guardado;
  }

  async listarResenasPorVoluntariado(voluntariado_id: number) {
    return this.resenaRepo.find({
      where: { voluntariado: { id_voluntariado: voluntariado_id } },
      relations: ['voluntario', 'voluntariado', 'voluntariado.creador'],
      order: { id_resena: 'DESC' },
    });
  }

}
