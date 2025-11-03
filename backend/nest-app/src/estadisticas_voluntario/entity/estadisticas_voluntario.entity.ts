import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';

@Entity('estadisticas_voluntario')
export class EstadisticasVoluntario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_estadistica: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Usuario;

  @Column({ type: 'int', default: 0 })
  horas_trabajadas: number;

  @Column({ type: 'int', default: 0 })
  participaciones: number;

  @Column({ type: 'float', default: 0 })
  porcentaje_asistencia: number;
}
