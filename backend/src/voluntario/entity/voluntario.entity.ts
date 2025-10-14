import { Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

@Entity('Voluntario')
export class Voluntario {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
