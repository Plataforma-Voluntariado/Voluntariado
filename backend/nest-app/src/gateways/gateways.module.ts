import { Module, Global } from '@nestjs/common';
import { BaseGateway } from './base.gateway';

@Global() 
@Module({
  providers: [],
  exports: [],
})
export class GatewaysModule {}
