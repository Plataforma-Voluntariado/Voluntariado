import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Voluntariado } from '../../voluntariado/entity/voluntariado.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_categoria: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  // Relación con Voluntariado 
  @OneToMany(() => Voluntariado, (voluntariado) => voluntariado.categoria)
  voluntariados: Voluntariado[];
}
