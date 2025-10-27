// users/users.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';
import { Socket } from 'socket.io'; // Asegúrate de importar Socket si es necesario, aunque BaseGateway lo maneja.

@WebSocketGateway({ namespace: '/usuario', ...websocketCorsConfig, })
export class UsersGateway extends BaseGateway {

  // AÑADIDO: Método para loguear la conexión del cliente
  protected override onClientConnected(client: Socket): void {
    console.log(`[UsersGateway] Cliente conectado: ${client.id}`);
  }

  // AÑADIDO: Método para loguear la desconexión
  protected override onClientDisconnected(client: Socket): void {
    console.log(`[UsersGateway] Cliente desconectado: ${client.id}`);
  }

  // Método específico para emitir novedades de usuario
  userNovedad(user: any) {
    this.server.emit('novedad-perfil', user);
  }

  // Implementación requerida del método abstracto
  protected getNamespace(): string {
    return '/usuario';
  }
}