import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';

export enum TipoNotificacion {
  INFO = 'INFO',
  ALERTA = 'ALERTA',
  MENSAJE = 'MENSAJE',
  RECORDATORIO = 'RECORDATORIO',
}

export enum EstadoNotificacion {
  ACTIVO = 'ACTIVO',
  ELIMINADO = 'ELIMINADO',
}

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id_notificacion: number;

  @Column({ type: 'enum', enum: TipoNotificacion, default: TipoNotificacion.INFO })
  tipo: TipoNotificacion;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'bigint', nullable: true })
  referencia_id: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url_redireccion: string | null;


  @CreateDateColumn({ type: 'datetime' })
  fecha: Date;

  @Column({ type: 'boolean', default: false })
  visto: boolean;

  @Column({ type: 'enum', enum: EstadoNotificacion, default: EstadoNotificacion.ACTIVO })
  estado: EstadoNotificacion;

  @ManyToMany(() => Usuario, usuario => usuario.notificaciones, { cascade: true })
  @JoinTable()
  usuarios: Usuario[];
}
