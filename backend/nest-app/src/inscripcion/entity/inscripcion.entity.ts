import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';

export enum EstadoInscripcion {
    PENDIENTE = 'PENDIENTE',
    ACEPTADA = 'ACEPTADA',
    RECHAZADA = 'RECHAZADA',
    CANCELADA = 'CANCELADA',
}

@Entity('inscripcion')
export class Inscripcion {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id_inscripcion: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    fecha_inscripcion: Date;

    @Column({
        type: 'enum',
        enum: EstadoInscripcion,
        default: EstadoInscripcion.PENDIENTE,
    })
    estado_inscripcion: EstadoInscripcion;

    @Column({ type: 'boolean', nullable: true })
    asistencia: boolean | null;

    @Column({ type: 'boolean', nullable: true })
    calificado: boolean | null;

    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'voluntario_id' })
    voluntario: Usuario;

    @ManyToOne(() => Voluntariado, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'voluntariado_id' })
    voluntariado: Voluntariado;

}
