import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { FotosVoluntariado } from 'src/fotos_voluntariado/entity/fotos_voluntariado.entity';
import { Ubicacion } from 'src/ubicacion/entity/ubicacion.entity';

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

  // 🔹 Relación con el usuario creador
  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'creador_id' })
  creador: Usuario;

  // 🔹 Relación con la categoría
  @ManyToOne(() => Categoria, (categoria) => categoria.voluntariados, { nullable: false })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  // 🔹 Relación con las fotos del voluntariado
  @OneToMany(() => FotosVoluntariado, (foto) => foto.voluntariado, {
    cascade: true,
  })
  fotos: FotosVoluntariado[];

  // 🔹 Relación uno a uno con la ubicación
  @OneToOne(() => Ubicacion, (ubicacion) => ubicacion.voluntariado, {
    cascade: true, // importante para guardar automáticamente la ubicación
  })
  @JoinColumn({ name: 'id_ubicacion' }) // crea la FK en voluntariado
  ubicacion: Ubicacion;
}
