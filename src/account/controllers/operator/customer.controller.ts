import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OperatorCustomerResponse } from '@src/account/contracts/openapi';
import {
  OperatorFindCustomersOutput,
  OperatorFindCustomersInput,
} from '@src/account/dtos/operator-find-customer.dto';
import { CustomerService } from '@src/account/services/customer.services';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
} from '@src/common/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';

@ApiTags('Operator')
@Controller('operator/customers')
@ApiBearerAuth()
@UseGuards(Auth0AuthGuard)
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @ApiDataOkResponse(OperatorFindCustomersOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findAll(
    @Query() params: OperatorFindCustomersInput,
    @pagination() paginationParam,
  ) {
    const result = await this.customerService.getCustomerList(
      params,
      paginationParam,
    );
    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: OperatorCustomerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async get(@Param('id') customerId: string) {
    return this.customerService.operatorGetDetailCustomer(customerId);
  }
}
