import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

export enum TipoEntidad {
  PUBLICA = 'PUBLICA',
  PRIVADA = 'PRIVADA',
  COMUNITARIA = 'COMUNITARIA',
}

@Entity('creador')
export class Creador {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @Column({ type: 'enum', enum: TipoEntidad })
  tipo_entidad: TipoEntidad;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'nombre_entidad' })
  nombre_entidad: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  direccion: string;

  @Column({ type: 'text', nullable: false })
  descripcion: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'sitio_web' })
  sitio_web?: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
