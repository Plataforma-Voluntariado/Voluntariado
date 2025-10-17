import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from 'src/config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token desde la cookie 'jwt'
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.jwt,
      ]),
      ignoreExpiration: false, // valida la expiración
      secretOrKey: configService.get<string>(JWT_SECRET),
    });
  }

  // Payload que viene del JWT
  async validate(payload: any) {
    return payload;
  }
}
