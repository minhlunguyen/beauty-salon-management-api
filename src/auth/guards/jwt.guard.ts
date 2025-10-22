import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '@src/auth/contracts/error';
import { HelperService } from '@src/auth/services/helper.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private helperService: HelperService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    const result = await super.canActivate(context);
    let returnedData;
    if (typeof result === 'boolean') {
      returnedData = result;
    } else {
      returnedData = await result.toPromise();
    }
    if (returnedData === false) {
      return false;
    }

    // add custom logic
    const request = context.switchToHttp().getRequest();
    const role = this.reflector.getAllAndOverride<string>('authRole', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!role) {
      const { code, message, status } = Errors.ROLE_NOT_EXIST;
      throw new AppException(code, message, status);
    }
    if (request.user.authRole !== role) {
      const { code, message, status } = Errors.INVALID_TOKEN;
      throw new AppException(code, message, status);
    }

    const authService = this.helperService.getAuthService(role);
    const user = await authService.getAuthenticationUser(request.user._id);
    request.user = user;
    return true;
  }
}
