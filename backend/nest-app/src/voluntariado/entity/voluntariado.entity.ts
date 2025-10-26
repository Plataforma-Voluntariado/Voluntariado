import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';

export enum EstadoVoluntariado {
  PENDIENTE = 'PENDIENTE',
  REALIZADO = 'REALIZADO',
  NO_REALIZADO = 'NO_REALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity('voluntariado')
export class Voluntariado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_voluntariado: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  titulo: string;

  @Column({ type: 'text', nullable: false })
  descripcion: string;

  @Column({ type: 'datetime', nullable: false, name: 'fecha_hora' })
  fechaHora: Date;

  @Column({ type: 'int', unsigned: true, nullable: false })
  horas: number;

  @Column({
    type: 'enum',
    enum: EstadoVoluntariado,
    default: EstadoVoluntariado.PENDIENTE,
  })
  estado: EstadoVoluntariado;

  // FK → usuario (creador)
  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'creador_id' })
  creador: Usuario;

  // FK → categoria
  @ManyToOne(() => Categoria, (categoria) => categoria.voluntariados, { nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}
