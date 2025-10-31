import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Voluntariado } from 'src/voluntariado/entity/voluntariado.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';

export enum EstadoInscripcion {
    PENDIENTE = 'PENDIENTE',
    ACEPTADA = 'ACEPTADA',
    RECHAZADA = 'RECHAZADA',
}

@Entity('inscripcion')
export class Inscripcion {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id_inscripcion: number;

    @Column({ type: 'date', nullable: false })
    fecha_inscripcion: Date;

    @Column({
        type: 'enum',
        enum: EstadoInscripcion,
        default: EstadoInscripcion.PENDIENTE,
    })
    estado_inscripcion: EstadoInscripcion;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    asistencia: boolean;

    @Column({ type: 'tinyint', width: 1, default: 0 })
    calificado: boolean;

    // Relación con el voluntario que se inscribe
    @ManyToOne(() => Usuario, { nullable: false })
    @JoinColumn({ name: 'voluntario_id' })
    voluntario: Usuario;

    // Relación con el voluntariado al que se inscribe
    @ManyToOne(() => Voluntariado, { nullable: false })
    @JoinColumn({ name: 'voluntariado_id' })
    voluntariado: Voluntariado;
}
