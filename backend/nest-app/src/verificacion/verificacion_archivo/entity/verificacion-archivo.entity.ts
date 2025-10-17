import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,} from 'typeorm';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';

export enum TipoDocumento {
  CEDULA = 'Cedula De Ciudadania',
  RUT = 'Registro Unico Tributario',
}

export enum EstadoArchivo {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity({ name: 'verificacion_archivo' })
export class VerificacionArchivo {
  @PrimaryGeneratedColumn({ name: 'id_verificacion_archivo', type: 'bigint' })
  idVerificacionArchivo: number;

  @ManyToOne(() => Verificacion, (verificacion) => verificacion.archivos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'verificacion_id' })
  verificacion: Verificacion;

  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumento,
  })
  tipoDocumento: TipoDocumento;

  @Column({ name: 'ruta_archivo', type: 'varchar', length: 255 })
  rutaArchivo: string;

  @Column({
    type: 'enum',
    enum: EstadoArchivo,
    default: EstadoArchivo.PENDIENTE,
  })
  estado: EstadoArchivo;

  @Column({ name: 'comentario_admin', type: 'text', nullable: true })
  comentarioAdmin?: string;

  @Column({ name: 'fecha_revision', type: 'datetime', nullable: true })
  fechaRevision?: Date;
}
