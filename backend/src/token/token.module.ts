import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Token } from './entity/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    ConfigModule
  ],
  providers: [TokenService],
  exports :[TokenService]
})
export class TokenModule { }
