import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoNotificacion, Notificacion } from './entity/notificacion.entity';
import { Usuario } from 'src/usuario/entity/usuario.entity';
import { NotificacionesGateway } from './notificaciones.gateway';

@Injectable()
export class NotificacionesService {
    constructor(
        @InjectRepository(Notificacion)
        private readonly notificacionRepo: Repository<Notificacion>,

        @InjectRepository(Usuario)
        private readonly usuarioRepo: Repository<Usuario>,
        private readonly notificacionesGateway: NotificacionesGateway,
    ) { }


    async crearYEnviarNotificacion(usuarioIds: number[], datos: Partial<Notificacion>,) {
        const usuarios = await this.usuarioRepo.findByIds(usuarioIds);

        if (!usuarios.length) {
            throw new Error('No se encontraron usuarios para notificar.');
        }

        const notificacion = this.notificacionRepo.create({
            ...datos,
            usuarios,
        });

        const guardada = await this.notificacionRepo.save(notificacion);

        this.notificacionesGateway.enviarNotificacion(usuarioIds, guardada);

        return guardada;
    }

    async obtenerPorUsuario(usuarioId: number) {
        return this.notificacionRepo
            .createQueryBuilder('notificacion')
            .leftJoinAndSelect('notificacion.usuarios', 'usuario')
            .where('usuario.id_usuario = :usuarioId', { usuarioId })
            .andWhere('notificacion.estado = :estado', { estado: 'ACTIVO' })
            .orderBy('notificacion.fecha', 'DESC')
            .getMany();
    }

    async marcarComoVista(usuarioId: number, notificacionId: number) {
        const notificacion = await this.notificacionRepo
            .createQueryBuilder('notificacion')
            .leftJoin('notificacion.usuarios', 'usuario')
            .where('usuario.id_usuario = :usuarioId', { usuarioId })
            .andWhere('notificacion.id_notificacion = :notificacionId', { notificacionId })
            .getOne();

        if (!notificacion) {
            throw new NotFoundException('Notificación no encontrada o no pertenece al usuario.');
        }

        notificacion.visto = true;
        const guardada = await this.notificacionRepo.save(notificacion);

        this.notificacionesGateway.notificacionVista([usuarioId], notificacionId);

        return guardada;
    }

    async eliminarNotificacion(usuarioId: number, notificacionId: number) {
        const notificacion = await this.notificacionRepo
            .createQueryBuilder("notificacion")
            .leftJoin("notificacion.usuarios", "usuario")
            .where("usuario.id_usuario = :usuarioId", { usuarioId })
            .andWhere("notificacion.id_notificacion = :notificacionId", { notificacionId })
            .getOne();

        if (!notificacion) {
            throw new NotFoundException('Notificación no encontrada o no pertenece al usuario.');
        }

        notificacion.estado = EstadoNotificacion.ELIMINADO;
        const guardada = await this.notificacionRepo.save(notificacion);

        this.notificacionesGateway.notificacionEliminada([usuarioId], notificacionId);

        return guardada;
    }


}
