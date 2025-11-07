import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';

@Entity('resenas_voluntariado')
export class ResenaVoluntariado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_resena: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  comentario: string;

  @Column({ type: 'tinyint', unsigned: true })
  calificacion: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Usuario;

  @ManyToOne(() => Voluntariado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntariado_id' })
  voluntariado: Voluntariado;
}
