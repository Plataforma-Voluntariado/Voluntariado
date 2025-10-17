import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ciudad } from '../../ciudad/entity/ciudad.entity';

@Entity('Departamento')
export class Departamento {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id_departamento: number;

  @Column({ type: 'varchar', length: 50, unique: true})
  departamento: string;

  @OneToMany(() => Ciudad, (ciudad) => ciudad.departamento)
  ciudades: Ciudad[];
}
