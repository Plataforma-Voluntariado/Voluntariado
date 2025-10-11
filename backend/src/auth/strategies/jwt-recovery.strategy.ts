import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_RECOVERY_SECRET } from 'src/config/constants';

@Injectable()
export class JwtRecoveryStrategy extends PassportStrategy(Strategy, 'jwt-recovery') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(JWT_RECOVERY_SECRET) || 'jwt_recovery_secret',
    });
  }

  async validate(payload: any) {
    // Validamos que el payload tenga el identificador esperado
    if (!payload?.sub) {
      throw new UnauthorizedException('Token de recuperación inválido.');
    }
    return payload;
  }
}
