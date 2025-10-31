import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Voluntariado } from '../../voluntariado/entity/voluntariado.entity';
import { Ciudad } from '../../ciudad/entity/ciudad.entity';

@Entity('ubicacion')
export class Ubicacion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_ubicacion: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  longitud: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  direccion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_sector: string;

  @OneToOne(() => Voluntariado, (voluntariado) => voluntariado.ubicacion, {
    onDelete: 'CASCADE', 
  })
  @JoinColumn({ name: 'voluntariado_id' }) 
  voluntariado: Voluntariado;

  @ManyToOne(() => Ciudad, (ciudad) => ciudad.id_ciudad, {
    nullable: false,
  })
  @JoinColumn({ name: 'ciudad_id' })
  ciudad: Ciudad;
}
