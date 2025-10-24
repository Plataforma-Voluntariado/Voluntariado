import { Module, Global } from '@nestjs/common';
import { BaseGateway } from './base.gateway';

@Global() // <- hace que no tengas que importarlo en cada módulo
@Module({
  providers: [BaseGateway],
  exports: [BaseGateway],
})
export class GatewaysModule {}
