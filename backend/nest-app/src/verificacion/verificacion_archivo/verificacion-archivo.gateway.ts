// src/verificacion/verificacion_archivo/verificacion-archivo.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from 'src/gateways/base.gateway';
import { websocketCorsConfig } from 'src/common/websocket.config';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/verificacion-archivo',
  ...websocketCorsConfig,
})
@Injectable()
export class VerificacionArchivoGateway extends BaseGateway {

  protected override onClientConnected(client: Socket): void {
    const userId = client.handshake.auth.userId as string;
  
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`👤 Usuario ${userId} unido a room user_${userId}`);
    }
  }


  protected override onClientDisconnected(client: Socket): void {
    console.log(`[VerificacionArchivoGateway] Cliente desconectado: ${client.id}`);
  }

  notificarUsuario(userId: number, tipo: "subido" | "aprobado" | "rechazado", archivo: any) {
    this.server.to(`user_${userId}`).emit("actualizacion-verificacion", {
      tipo,
      archivo,
    });
  }

  protected getNamespace(): string {
    return '/verificacion-archivo';
  }
}
