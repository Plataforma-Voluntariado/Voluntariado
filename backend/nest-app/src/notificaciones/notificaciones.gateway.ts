import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/notificaciones',
  ...websocketCorsConfig,
})
@Injectable()
export class NotificacionesGateway extends BaseGateway {

  protected override onClientConnected(client: Socket): void {
    const userId = client.handshake.auth.userId as string;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`[NotificacionesGateway] Usuario ${userId} unido a su room Cliente ${client.id}`);
    }
  }

  protected override onClientDisconnected(client: Socket): void {
    console.log(`[NotificacionesGateway] Cliente ${client.id} salió de su room`);
  }

  async enviarNotificacion(usuarioIds: number[], notificacion: any) {
    usuarioIds.forEach((id) => {
      this.server.to(`user_${id}`).emit('notificacion', notificacion);
    });
  }

  async notificacionVista(usuarioIds: number[], notificacionId: number) {
    usuarioIds.forEach((id) => {
      this.server.to(`user_${id}`).emit('notificacionVista', { id_notificacion: notificacionId });
    });
  }

  async notificacionEliminada(usuarioIds: number[], notificacionId: number) {
    usuarioIds.forEach((id) => {
      this.server
        .to(`user_${id}`)
        .emit('notificacionEliminada', { id_notificacion: notificacionId });
    });
  }


  protected getNamespace(): string {
    return '/notificaciones';
  }
}

