import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Ciudad } from 'src/ciudad/entity/ciudad.entity';
import { Creador } from 'src/creador/entity/creador.entity';
import { Voluntario } from 'src/voluntario/entity/voluntario.entity';
import { Administrador } from 'src/administrador/entity/administrador.entity';
import { Token } from 'src/token/entity/token.entity';

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

}

