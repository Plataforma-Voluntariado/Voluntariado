import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';

@Entity('comentarios_voluntariado')
export class ComentariosVoluntariado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_comentario: number;

  // 🔹 Usuario que hace el comentario (voluntario)
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Usuario;

  // 🔹 Usuario creador del voluntariado
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creador_id' })
  creador: Usuario;

  // 🔹 Voluntariado asociado
  @ManyToOne(() => Voluntariado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_voluntariado' })
  voluntariado: Voluntariado;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comentario: string;

  @Column({ type: 'tinyint', unsigned: true })
  calificacion: number; // Valor de 1 a 5

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;
}
