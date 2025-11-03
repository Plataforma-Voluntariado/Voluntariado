import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComentariosVoluntariado } from './entity/comentarios_voluntariado.entity';
import { CreateComentarioVoluntariadoDto } from './dto/create-comentario_voluntariado.dto';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Inscripcion, EstadoInscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Usuario, RolUsuario } from 'src/usuario/entity/usuario.entity';

@Injectable()
export class ComentariosVoluntariadoService {
  constructor(
    @InjectRepository(ComentariosVoluntariado)
    private comentarioRepo: Repository<ComentariosVoluntariado>,

    @InjectRepository(Voluntariado)
    private voluntariadoRepo: Repository<Voluntariado>,

    @InjectRepository(Inscripcion)
    private inscripcionRepo: Repository<Inscripcion>,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) { }

  async crearComentario(dto: CreateComentarioVoluntariadoDto) {
    const { voluntario_id, creador_id, calificacion, comentario, voluntariado_id } = dto;

    //  Buscar voluntario y creador
    const [voluntario, creador] = await Promise.all([
      this.usuarioRepo.findOne({ where: { id_usuario: voluntario_id } }),
      this.usuarioRepo.findOne({ where: { id_usuario: creador_id } }),
    ]);

    if (!voluntario) throw new NotFoundException('Voluntario no encontrado');
    if (!creador) throw new NotFoundException('Creador no encontrado');

    if (voluntario.rol !== RolUsuario.VOLUNTARIO)
      throw new ForbiddenException('Solo los voluntarios pueden calificar voluntariados.');

    //  Buscar voluntariado
    const voluntariado = await this.voluntariadoRepo.findOne({
      where: { id_voluntariado: voluntariado_id },
      relations: ['creador'],
    });

    if (!voluntariado) throw new NotFoundException('Voluntariado no encontrado');
    if (voluntariado.estado !== 'terminado')
      throw new BadRequestException('Solo se pueden calificar voluntariados terminados.');

    // Buscar inscripción válida
    const inscripcion = await this.inscripcionRepo.findOne({
      where: {
        voluntario: { id_usuario: voluntario_id },
        voluntariado: { id_voluntariado: voluntariado.id_voluntariado },
        estado_inscripcion: EstadoInscripcion.ACEPTADA,
      },
    });

    if (!inscripcion)
      throw new ForbiddenException('No puedes calificar este voluntariado, no estás inscrito.');

    //  Verificar asistencia obligatoria
    if (!inscripcion.asistencia)
      throw new ForbiddenException('Solo puedes calificar si asististe al voluntariado.');

    // Verificar comentario previo
    const comentarioExistente = await this.comentarioRepo.findOne({
      where: {
        voluntario: { id_usuario: voluntario_id },
        voluntariado: { id_voluntariado: voluntariado.id_voluntariado },
      },
    });

    if (comentarioExistente)
      throw new BadRequestException('Ya has calificado este voluntariado.');

    //  Crear comentario y guardar
    const nuevoComentario = this.comentarioRepo.create({
      voluntario,
      creador,
      voluntariado,
      comentario,
      calificacion,
    });

    const guardado = await this.comentarioRepo.save(nuevoComentario);

    //  Actualizar el campo calificado = true en la inscripción
    inscripcion.calificado = true;
    await this.inscripcionRepo.save(inscripcion);

    return guardado;
  }


  async listarComentarios() {
    return this.comentarioRepo.find({
      relations: ['voluntario', 'creador'],
      order: { id_comentario: 'DESC' },
    });
  }
}
