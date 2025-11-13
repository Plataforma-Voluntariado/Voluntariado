import { Module, Global } from '@nestjs/common';
import { InscripcionGateway } from '../inscripcion/inscripcion.gateway';

@Global()
@Module({
  providers: [InscripcionGateway],
  exports: [InscripcionGateway],
})
export class GatewaysModule {}
