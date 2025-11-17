import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Inscripcion } from 'src/inscripcion/entity/inscripcion.entity';

@Entity('certificado')
@Unique(['inscripcion'])
export class Certificado {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id_certificado: number;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntario_id' })
  voluntario: Usuario;

  @ManyToOne(() => Voluntariado, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voluntariado_id' })
  voluntariado: Voluntariado;

  @ManyToOne(() => Inscripcion, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion;

  @Column({ type: 'varchar', length: 500, nullable: false })
  url_pdf: string;

  @Column({ type: 'varchar', length: 64, nullable: false, unique: true })
  hash_verificacion: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  emitido_en: Date;
}
