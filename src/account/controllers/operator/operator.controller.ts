import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { OperatorService } from '@src/account/services/operator.services';
import { pagination } from '@src/common/decorators/pagination';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  ApiDataOkResponse,
  ErrorResponse,
  SuccessResponse,
} from '@src/common/contracts/openapi';
import {
  OperatorRolePaginateResponse,
  OperatorListPaginateResponse,
} from '@src/account/contracts/openapi';
import { OperatorFindRoleDto } from '@src/account/dtos/operator-find-role.dto';
import { OperatorInviteDto } from '@src/account/dtos/operator-invite.dto';
import { OperatorFindOperatorDto } from '@src/account/dtos/operator-find-operator.dto';

@Controller('operator')
@UseGuards(Auth0AuthGuard)
@ApiTags('Operator')
@ApiBearerAuth()
export class OperatorController {
  constructor(private operatorService: OperatorService) {}

  @Get('/operators')
  @ApiDataOkResponse(OperatorListPaginateResponse)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findAll(
    @Query() params: OperatorFindOperatorDto,
    @pagination() paginateDto: PaginateDto,
  ) {
    const result = await this.operatorService.getOperatorList(
      params,
      paginateDto,
    );
    return result;
  }

  @Get('/roles')
  @ApiDataOkResponse(OperatorRolePaginateResponse)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findRoles(
    @Query() params: OperatorFindRoleDto,
    @pagination() paginateDto: PaginateDto,
  ) {
    return this.operatorService.getRoles(params, paginateDto);
  }

  @Post('/operators/invite')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async invite(@Body() params: OperatorInviteDto) {
    return this.operatorService.inviteUser(params);
  }
}
