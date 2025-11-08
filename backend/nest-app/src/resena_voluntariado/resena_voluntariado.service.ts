import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import axios from 'axios';
import { ResenaVoluntariado } from './entity/resenas_voluntariado.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';
import { ConfigService } from '@nestjs/config';
import { FASTAPISENTIMIENTO_URL } from 'src/config/constants';
import { EstadisticasVoluntarioService } from 'src/estadisticas_voluntario/estadisticas_voluntario.service';
import { CreateResenaVoluntariadoDto } from './dto/create-resena_voluntariado.dto';

@Injectable()
export class ResenaVoluntariadoService {
  constructor(
    @InjectRepository(ResenaVoluntariado)
    private readonly resenaRepo: Repository<ResenaVoluntariado>,

    @InjectRepository(Voluntariado)
    private readonly voluntariadoRepo: Repository<Voluntariado>,

    @InjectRepository(Inscripcion)
    private readonly inscripcionRepo: Repository<Inscripcion>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,

    private readonly configService: ConfigService,
    private readonly estadisticasService: EstadisticasVoluntarioService,
    private dataSource: DataSource
  ) { }

  private async enviarAFastAPIComentario(comentario: string): Promise<number> {
    try {
      const fastApiUrl = this.configService.get<string>(FASTAPISENTIMIENTO_URL);
      if (!fastApiUrl) throw new BadRequestException('La URL de FastAPI para sentimiento no está configurada.');
      const response = await axios.post(fastApiUrl, { comentario });
      return response.data.estrellas;
    } catch (error) {
      console.error('Error al analizar comentario con FastAPI:', error?.response?.data || error);
      throw new BadRequestException('No se pudo analizar el comentario con la IA.');
    }
  }

  async crearResena(dto: CreateResenaVoluntariadoDto & { voluntario_id: number; voluntariado_id: number }) {
    const { voluntario_id, voluntariado_id, comentario } = dto;

    // Buscar voluntario y voluntariado en paralelo
    const [voluntario, voluntariado] = await Promise.all([
      this.usuarioRepo.findOne({ where: { id_usuario: voluntario_id } }),
      this.voluntariadoRepo.findOne({ where: { id_voluntariado: voluntariado_id }, relations: ['creador'] })
    ]);

    if (!voluntario) throw new NotFoundException('Voluntario no encontrado');
    if (voluntario.rol !== RolUsuario.VOLUNTARIO) throw new ForbiddenException('Solo los voluntarios pueden dejar reseñas.');
    if (!voluntariado) throw new NotFoundException('Voluntariado no encontrado');
    if (voluntariado.estado !== 'terminado') throw new BadRequestException('Solo se pueden reseñar voluntariados terminados.');

    // Buscar inscripción y reseña existente en paralelo
    const [inscripcion, resenaExistente] = await Promise.all([
      this.inscripcionRepo.findOne({
        where: { voluntario: { id_usuario: voluntario_id }, voluntariado: { id_voluntariado: voluntariado_id }, estado_inscripcion: EstadoInscripcion.ACEPTADA }
      }),
      this.resenaRepo.findOne({
        where: { voluntario: { id_usuario: voluntario_id }, voluntariado: { id_voluntariado: voluntariado_id } }
      })
    ]);

    if (!inscripcion) throw new ForbiddenException('No puedes reseñar este voluntariado');
    if (!inscripcion.asistencia) throw new ForbiddenException('Solo puedes reseñar si asististe al voluntariado.');
    if (resenaExistente) throw new BadRequestException('Ya has dejado una reseña para este voluntariado.');

    const estrellas = await this.enviarAFastAPIComentario(comentario);

    // Crear y guardar reseña
    const nuevaResena = this.resenaRepo.create({ voluntario, voluntariado, comentario, calificacion: estrellas });
    const guardado = await this.resenaRepo.save(nuevaResena);

    // Actualizar inscripción y estadísticas en paralelo
    await Promise.all([
      (async () => { inscripcion.calificado = true; await this.inscripcionRepo.save(inscripcion); })(),
      this.estadisticasService.actualizarEstadisticasPorAsistencia(voluntario_id, voluntariado_id)
    ]);

    return guardado;
  }

  async listarResenasPorVoluntariado(voluntariado_id: number) {
    const voluntariado = await this.dataSource
      .getRepository(Voluntariado)
      .createQueryBuilder('v')
      .where('v.id_voluntariado = :id', { id: voluntariado_id })
      .getOne();

    if (!voluntariado) {
      throw new NotFoundException(`El voluntariado con id ${voluntariado_id} no existe`);
    }

    const resenas = await this.dataSource
      .getRepository(ResenaVoluntariado)
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.voluntario', 'voluntario')
      .leftJoinAndSelect('r.voluntariado', 'voluntariado')
      .leftJoinAndSelect('voluntariado.creador', 'creador')
      .where('voluntariado.id_voluntariado = :id', { id: voluntariado_id })
      .orderBy('r.id_resena', 'DESC')
      .getMany();

    if (!resenas || resenas.length === 0) {
      throw new NotFoundException(`El voluntariado con id ${voluntariado_id} no tiene reseñas`);
    }

    return resenas;
  }
}
