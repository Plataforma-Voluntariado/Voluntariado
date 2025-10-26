// users/users.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from '../gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';

@WebSocketGateway({
  namespace: '/usuario',
  ...websocketCorsConfig,
})
export class UsersGateway extends BaseGateway {

  userNovedad(user: any) {
    this.emit('novedad-perfil', user);
  }

  

}