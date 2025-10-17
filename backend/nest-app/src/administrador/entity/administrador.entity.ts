import { Entity, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';

@Entity('Administrador')
export class Administrador {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @OneToMany(() => Verificacion, (verificacion) => verificacion.admin)
  verificacionesRevisadas: Verificacion[];

}
