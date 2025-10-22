import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AuthServiceInterface } from '@src/auth/interfaces/auth-service.interface';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '@src/auth/contracts/error';

@Injectable()
export class HelperService {
  constructor(private moduleRef: ModuleRef) {}

  static generateServiceName(role: string): string {
    return `auth_${role}_service`;
  }

  generateServiceName(role: string): string {
    return HelperService.generateServiceName(role);
  }

  getAuthService(role: string): AuthServiceInterface {
    try {
      const roleService: AuthServiceInterface =
        this.moduleRef.get<AuthServiceInterface>(
          this.generateServiceName(role),
          { strict: false },
        );
      return roleService;
    } catch (error) {
      const { code, message, status } = Errors.AUTH_NOT_EXIST;
      throw new AppException(code, message, status);
    }
  }
}
