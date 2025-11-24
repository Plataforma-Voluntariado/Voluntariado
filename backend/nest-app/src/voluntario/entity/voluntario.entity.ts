import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { EstadisticasVoluntario } from 'src/estadisticas_voluntario/entity/estadisticas_voluntario.entity';

@Entity('voluntario')
export class Voluntario {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToOne(() => EstadisticasVoluntario, (estadisticas) => estadisticas.voluntario, { cascade: true, onDelete: 'CASCADE' })
  estadisticas?: EstadisticasVoluntario;
}
