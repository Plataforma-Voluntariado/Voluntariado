import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRecoveryGuard extends AuthGuard('jwt-recovery') {}
