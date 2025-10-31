import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,JoinColumn,} from 'typeorm';
import { Voluntariado } from '../../voluntariado/entity/voluntariado.entity';

@Entity('fotos_voluntariado')
export class FotosVoluntariado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_foto: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  url: string;
  
  @ManyToOne(() => Voluntariado, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntariado_id' })
  voluntariado: Voluntariado;
}
