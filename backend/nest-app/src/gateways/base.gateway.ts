import { WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export abstract class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  afterInit() {
    console.log(`[Gateway] Inicializado: ${this.constructor.name}`);
  }

  handleConnection(client: Socket) {
    if (client.nsp.name !== this.getNamespace()) return;

    this.onClientConnected(client);
  }

  handleDisconnect(client: Socket) {
    if (client.nsp.name !== this.getNamespace()) return;

    console.log(`[Gateway] Cliente desconectado: ${client.id}`);
    this.onClientDisconnected(client);
  }

  protected onClientConnected(client: Socket): void { }
  protected onClientDisconnected(client: Socket): void { }

 
  protected abstract getNamespace(): string;
}
