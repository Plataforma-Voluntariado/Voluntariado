import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,CreateDateColumn, JoinColumn} from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

export enum TipoToken {
  RECUPERAR_CONTRASENA = 'RECUPERAR_CONTRASENA',
  CONFIRMAR_CORREO = 'CONFIRMAR_CORREO',
}

export enum EstadoToken {
  ACTIVO = 'ACTIVO',
  EXPIRADO = 'EXPIRADO',
  USADO = 'USADO',
}

@Entity({ name: 'Token' })
export class Token {
  @PrimaryGeneratedColumn({ name: 'id_token', type: 'bigint', unsigned: true })
  idToken: number;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @Column({ name: 'fecha_expiracion', type: 'datetime' })
  fechaExpiracion: Date;

  @Column({
    type: 'enum',
    enum: TipoToken,
  })
  tipo: TipoToken;

  @Column({
    type: 'enum',
    enum: EstadoToken,
    default: EstadoToken.ACTIVO,
  })
  estado: EstadoToken;

  @Column({ name: 'intentos_restantes', type: 'int', default: 3 })
  intentosRestantes: number;

  
  @ManyToOne(() => Usuario, (usuario) => usuario.tokens)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
