import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Ciudad } from '../../ciudad/entity/ciudad.entity';
import { Creador } from '../../creador/entity/creador.entity';
import { Voluntario } from '../../voluntario/entity/voluntario.entity';
import { Administrador } from '../../administrador/entity/administrador.entity';
import { Token } from '../../token/entity/token.entity';
import { Verificacion } from 'src/verificacion/entity/verificacion.entity';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  VOLUNTARIO = 'VOLUNTARIO',
  CREADOR = 'CREADOR',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  BLOQUEADO = 'BLOQUEADO',
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_usuario: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apellido?: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  contrasena: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  telefono: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_nacimiento' })
  fecha_nacimiento?: Date;

  @Column({ type: 'enum', enum: RolUsuario, nullable: false })
  rol: RolUsuario;

  @Column({ type: 'enum', enum: EstadoUsuario, default: EstadoUsuario.ACTIVO })
  estado: EstadoUsuario;

  @Column({ type: 'boolean', default: false })
  verificado: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'url_imagen' })
  url_imagen?: string;

  @ManyToOne(() => Ciudad)
  @JoinColumn({ name: 'id_ciudad' })
  ciudad: Ciudad;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', name: 'fecha_registro' })
  fecha_Registro: Date;

  @Column({ type: 'boolean', default: false })
  correo_verificado: boolean;


  @OneToOne(() => Creador, (creador) => creador.usuario)
  creador?: Creador;

  @OneToOne(() => Voluntario, (voluntario) => voluntario.usuario)
  voluntario?: Voluntario;

  @OneToOne(() => Administrador, (admin) => admin.usuario)
  admin?: Administrador;

  @OneToMany(() => Token, (token) => token.usuario)
  tokens: Token[];

  @OneToOne(() => Verificacion, (verificacion) => verificacion.usuario)
  verificacion: Verificacion;

}

