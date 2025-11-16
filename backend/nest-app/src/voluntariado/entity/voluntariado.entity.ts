import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, } from 'typeorm';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { FotosVoluntariado } from 'src/fotos_voluntariado/entity/fotos_voluntariado.entity';
import { Ubicacion } from 'src/ubicacion/entity/ubicacion.entity';
import { EstadoInscripcion, Inscripcion } from 'src/inscripcion/entity/inscripcion.entity';
import { Expose } from 'class-transformer';
import { ResenaVoluntariado } from 'src/resena_voluntariado/entity/resenas_voluntariado.entity';

export enum EstadoVoluntariado {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  TERMINADO = 'terminado',
  CANCELADO = 'cancelado'
}

@Entity('voluntariado')
export class Voluntariado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_voluntariado: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  descripcion: string;

  @Column({ type: 'datetime', nullable: false })
  fechaHoraInicio: Date;

  @Column({ type: 'datetime', nullable: false })
  fechaHoraFin: Date;

  @Column({ type: 'int', unsigned: true, nullable: false })
  horas: number;

  @Column({ type: 'int', unsigned: true, nullable: false, default: 10 })
  maxParticipantes: number;


  @Column({
    type: 'enum',
    enum: EstadoVoluntariado,
    default: EstadoVoluntariado.PENDIENTE,
  })
  estado: EstadoVoluntariado;

  // Relación con el usuario creador
  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'creador_id' })
  creador: Usuario;

  // Relación con la categoría
  @ManyToOne(() => Categoria, (categoria) => categoria.voluntariados, { nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  // Relación con las fotos del voluntariado
  @OneToMany(() => FotosVoluntariado, (foto) => foto.voluntariado, {
    cascade: true,
  })
  fotos: FotosVoluntariado[];

  // Relación uno a uno con la ubicación
  @OneToOne(() => Ubicacion, (ubicacion) => ubicacion.voluntariado, {
    cascade: true,
  })
  ubicacion: Ubicacion;

  //relacion uno a muchos con inscripcion 
  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.voluntariado, {
    cascade: true,
  })
  inscripciones: Inscripcion[];

  @OneToMany(() => ResenaVoluntariado, (resena) => resena.voluntariado, { cascade: true })
  resenas: ResenaVoluntariado[];


  @Expose()
  get participantesAceptados(): number {
    if (!this.inscripciones) return 0;
    return this.inscripciones.filter(
      (i) => i.estado_inscripcion === EstadoInscripcion.ACEPTADA
    ).length;
  }

  @Expose()
  get promedioCalificacion(): number {
    if (!this.resenas || this.resenas.length === 0) return 0;
    const suma = this.resenas.reduce((acc, resena) => acc + resena.calificacion, 0);
    return Number((suma / this.resenas.length).toFixed(1));
  }
}