import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { VerificacionArchivo } from 'src/verificacion/verificacion_archivo/entity/verificacion-archivo.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, OneToOne, ManyToOne, OneToMany, } from 'typeorm';

export enum EstadoVerificacion {
  PENDIENTE = 'pendiente',
  VERIFICADO = 'verificado',
  RECHAZADO = 'rechazado',
}

@Entity({ name: 'verificacion' })
export class Verificacion {
  @PrimaryGeneratedColumn({ name: 'id_verificacion', type: 'bigint' })
  idVerificacion: number;

  @Column({
    type: 'enum',
    enum: EstadoVerificacion,
    default: EstadoVerificacion.PENDIENTE,
  })
  estado: EstadoVerificacion;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_revision', type: 'datetime', nullable: true })
  fechaRevision?: Date;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => Administrador, (admin) => admin.verificacionesRevisadas, { nullable: true, onDelete: 'SET NULL', })
  @JoinColumn({ name: 'admin_id' })
  admin?: Administrador;

  @OneToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => VerificacionArchivo, (archivo) => archivo.verificacion, {cascade: true,})
  archivos: VerificacionArchivo[];


}
