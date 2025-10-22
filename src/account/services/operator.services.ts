import { Injectable } from '@nestjs/common';
import { Platform } from '@c2c-platform/sdk-server';
import { ConfigService } from '@nestjs/config';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  OperatorRoleListItem,
  OperatorRolePaginateResponse,
  OperatorListItem,
  OperatorListPaginateResponse,
  OperatorRoleItem,
} from '../contracts/openapi';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import { OperatorFindRoleDto } from '../dtos/operator-find-role.dto';
import { OperatorInviteDto } from '../dtos/operator-invite.dto';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '../contracts/error';
import { OperatorFindOperatorDto } from '../dtos/operator-find-operator.dto';

@Injectable()
export class OperatorService {
  private _c2cPlatform: Platform;

  constructor(
    private commonUtilService: CommonUtilService,
    private configService: ConfigService,
  ) {
    this._c2cPlatform = new Platform({
      baseUrl: this.configService.get<string>('systemAdminServiceUrl'),
      clientSecret: this.configService.get<string>('systemAdminClientSecret'),
      clientId: this.configService.get<string>('systemAdminClientId'),
    });
  }

  /**
   *
   * @param {OperatorFindOperatorDto} params,
   * @param {PaginateDto} pagination
   * @returns {Promise<OperatorListPaginateResponse>}
   */
  async getOperatorList(
    params: OperatorFindOperatorDto,
    pagination: PaginateDto,
  ): Promise<OperatorListPaginateResponse> {
    try {
      const result = await this._c2cPlatform.user.findUsers({
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        keyword: params?.keyword,
      });
      const docs = result.data.map(
        (user) =>
          ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles:
              user?.roles.map(
                (role) =>
                  ({
                    id: role.id,
                    code: role.code,
                    name: role.name,
                  } as OperatorRoleItem),
              ) || [],
            lastLogin: user?.lastLogin ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as OperatorListItem),
      );
      const { skip, limit, total } = result.pagination;
      const paginationData = this.commonUtilService.calcPaginateData(
        skip,
        limit,
        total,
      );

      return { docs, ...paginationData };
    } catch (error) {
      if (error.code) {
        const { code, message, status } = error;
        throw new AppException(code, message, status);
      }

      const { code, message, status } = Errors.SA_UNKNOWN_ERROR;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Get roles
   *
   * @param {OperatorFindRoleDto} params,
   * @param {PaginateDto} pagination
   * @returns {Promise<OperatorRolePaginateResponse>}
   */
  async getRoles(
    params: OperatorFindRoleDto,
    pagination: PaginateDto,
  ): Promise<OperatorRolePaginateResponse> {
    try {
      const result = await this._c2cPlatform.role.findRoles({
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        keyword: params?.keyword,
      });

      const docs = result.data.map(
        (role) =>
          ({
            id: role.id,
            name: role.name,
            code: role.code,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          } as OperatorRoleListItem),
      );
      const { skip, limit, total } = result.pagination;
      const paginationData = this.commonUtilService.calcPaginateData(
        skip,
        limit,
        total,
      );

      return { docs, ...paginationData };
    } catch (error) {
      if (error.code) {
        const { code, message, status } = error;
        throw new AppException(code, message, status);
      }

      const { code, message, status } = Errors.SA_UNKNOWN_ERROR;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Invite operator user
   *
   * @param {OperatorInviteDto} params
   * @returns Promise<boolean>
   */
  async inviteUser(params: OperatorInviteDto): Promise<boolean> {
    try {
      const result = await this._c2cPlatform.user.inviteUser({
        email: params.email,
        roleIds: params.roleIds,
      });

      return (result as any).data ?? false;
    } catch (error) {
      if (error.code) {
        const { code, message, status } = error;
        throw new AppException(code, message, status);
      }

      const { code, message, status } = Errors.SA_UNKNOWN_ERROR;
      throw new AppException(code, message, status);
    }
  }
}
