import { Controller, UseGuards, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import { SaleService } from '@src/sale/services/sale.service';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  SearchSaleInput,
  SearchSaleOutput,
} from '@src/sale/dtos/search-sale.dto';
import {
  ApiDataOkResponse,
  ErrorResponse,
} from '@src/common/contracts/openapi';
@ApiTags('Sales (Operator)')
@Controller('operator/sales')
@UseGuards(Auth0AuthGuard)
@ApiBearerAuth()
export class OperatorSaleController {
  constructor(private saleService: SaleService) {}
  @Get()
  @ApiQuery({ type: PaginateDto })
  @ApiDataOkResponse(SearchSaleOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async find(
    @Query() params: SearchSaleInput,
    @pagination() paginateDto: PaginateDto,
  ) {
    return this.saleService.findSales(params, paginateDto);
  }
}
