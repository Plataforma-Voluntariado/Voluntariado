import { WebSocketGateway } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { BaseGateway } from 'src/gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';

@WebSocketGateway({
  namespace: '/inscripcion',
  ...websocketCorsConfig,
})
@Injectable()
export class InscripcionGateway extends BaseGateway {

  protected override onClientConnected(client: Socket): void {
    console.log(`[InscripcionGateway] Cliente conectado ${client.id}`);
  }

  protected override onClientDisconnected(client: Socket): void {
    console.log(`[InscripcionGateway] Cliente ${client.id} desconectado`);
  }

  @OnEvent('inscripcion.created')
  handleInscripcionCreated(payload: any) {
    if (!this.server) return;
    this.server.emit('inscripcion.changed', { action: 'created', payload });
  }

  @OnEvent('inscripcion.updated')
  handleInscripcionUpdated(payload: any) {
    if (!this.server) return;
    this.server.emit('inscripcion.changed', { action: 'updated', payload });
  }

  @OnEvent('inscripcion.asistencia_marked')
  handleAsistenciaMarked(payload: any) {
    if (!this.server) return;
    this.server.emit('inscripcion.changed', { action: 'asistencia_marked', payload });
  }

  protected getNamespace(): string {
    return '/inscripcion';
  }
}
