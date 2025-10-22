import { Module, DynamicModule, Global } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { AuthController } from './controllers/auth.controller';
import { HelperService } from '@src/auth/services/helper.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@src/auth/strategies/jwt.strategy';
import * as _ from 'lodash';
import { AppException } from '@src/common/exceptions/app.exception';

import { TokenService } from '@src/auth/services/token.services';
import { TokenRepository } from '@src/auth/repositories/token.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from '@src/auth/schemas/token.schema';
import { LocalJwtAuthGuard } from '@src/auth/guards/local-jwt.guard';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { Auth0AuthGuard } from './guards/auth0.guard';

interface role {
  role: string;
  service: any;
}

@Global()
@Module({
  providers: [
    JwtAuthGuard,
    HelperService,
    JwtStrategy,
    TokenService,
    TokenRepository,
    LocalJwtAuthGuard,
    Auth0Strategy,
    Auth0AuthGuard,
  ],
  exports: [
    JwtAuthGuard,
    HelperService,
    JwtStrategy,
    TokenService,
    TokenRepository,
    Auth0Strategy,
    Auth0AuthGuard,
  ],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
})
export class AuthModule {
  static forRoot(options: role[]): DynamicModule {
    const providers = options.map((item) => {
      if (!AuthModule.isAuthService(item.service)) {
        throw new AppException(
          '',
          `${item.service.name} does not implement AuthServiceInterface`,
        );
      }
      return {
        provide: HelperService.generateServiceName(item.role),
        useExisting: item.service,
      };
    });
    return {
      module: AuthModule,
      providers,
      exports: [...providers],
    };
  }

  static isAuthService(authService) {
    const functions = Object.getOwnPropertyNames(authService.prototype);
    return (
      _.difference(['validateUser', 'getAuthenticationUser'], functions)
        .length === 0
    );
  }
}
