import {Entity,PrimaryGeneratedColumn,Column,OneToOne,JoinColumn,} from 'typeorm';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';

@Entity('estadisticas_voluntario')
export class EstadisticasVoluntario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_estadistica: number;

  @OneToOne(() => Voluntario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Voluntario;

  @Column({ type: 'int', default: 0 })
  horas_trabajadas: number;

  @Column({ type: 'int', default: 0 })
  participaciones: number;

  @Column({ type: 'float', default: 0 })
  porcentaje_asistencia: number;
}
