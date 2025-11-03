// src/bull/bull.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_HOST, REDIS_PORT } from 'src/config/constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>(REDIS_HOST) || 'localhost',
          port: Number(config.get<string>(REDIS_PORT)) || 6379,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'voluntariado' }),
  ],
  providers: [
  ],
  exports: [
    BullModule 
  ],
})
export class BullMqModule { }