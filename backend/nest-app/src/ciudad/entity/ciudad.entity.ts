import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Departamento } from '../../departamento/entity/departamento.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';

@Entity('Ciudad')
export class Ciudad {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_ciudad: number;

  @Column({ type: 'varchar', length: 255, })
  ciudad: string;

  @ManyToOne(() => Departamento, (departamento) => departamento.ciudades)
  @JoinColumn({ name: 'id_departamento' })
  departamento: Departamento;

  @OneToMany(() => Usuario, (usuario) => usuario.ciudad)
  usuarios: Usuario[];
}
