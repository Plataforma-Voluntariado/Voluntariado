// src/verificacion/verificacion_archivo/verificacion-archivo-admin.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from 'src/gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/verificacion-archivo-admin',
  ...websocketCorsConfig,
})
@Injectable()
export class VerificacionArchivoAdminGateway extends BaseGateway {
  protected override onClientConnected(client: Socket): void {
    const userId = client.handshake.auth.userId as string;
    client.join("admins_room");
    console.log(`🧑‍💼 Admin ${userId} unido a room admins_room ✅`);
  }

  protected override onClientDisconnected(client: Socket): void {}

  notificarAdmins(tipo: "subido" | "aprobado" | "rechazado", data: any) {
    this.server.to('admins_room').emit("actualizacion-verificacion-admin", {
      tipo,
      data,
    });
  }

  protected getNamespace(): string {
    return '/verificacion-archivo-admin';
  }
}
