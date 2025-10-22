import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth0SecretKey'),
      algorithms: ['HS256'],
      issuer: configService.get<string>('auth0Issuer'),
      audience: configService.get<string>('auth0Audience'),
    });
  }

  async validate(payload: any) {
    return { auth0Id: payload.sub };
  }
}
