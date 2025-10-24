import {WebSocketGateway,WebSocketServer,OnGatewayConnection,OnGatewayDisconnect,OnGatewayInit,} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { websocketCorsConfig } from 'src/common/websocket.config';

@WebSocketGateway(websocketCorsConfig)
export class BaseGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log(`[Gateway] Inicializado: ${this.constructor.name}`);
  }

  handleConnection(client: Socket) {
    console.log(`[Gateway] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Cliente desconectado: ${client.id}`);
  }

  emit(event: string, payload?: any) {
    this.server.emit(event, payload);
  }
}
