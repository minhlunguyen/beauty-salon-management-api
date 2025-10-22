import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { GetSalonByOperatorOutput } from '@src/salon/dtos/get-salon-by-operator.dto';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
  SuccessResponse,
} from '@src/common/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  OperatorGetListSalonDto,
  OperatorGetListSalonOutput,
} from '@src/salon/dtos/operator-list-salon.dto';
import { SalonService } from '@src/salon/services/salon.service';
import { OperatorUpdateSalonDto } from '@src/salon/dtos/operator-update-salon.dto';

@ApiTags('Salon (Operator)')
@Controller('operator/salons')
@UseGuards(Auth0AuthGuard)
@ApiBearerAuth()
export class OperatorSalonController {
  constructor(private readonly salonService: SalonService) {}

  @Get()
  @ApiQuery({ type: PaginateDto })
  @ApiDataOkResponse(OperatorGetListSalonOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async find(
    @Query() params: OperatorGetListSalonDto,
    @pagination() paginateDto: PaginateDto,
  ) {
    return this.salonService.findSalonForOperator(params, paginateDto);
  }

  @Get(':id')
  @ApiDataOkResponse(GetSalonByOperatorOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async get(@Param('id') salonId: string) {
    return this.salonService.getSalonByIdForOperator(salonId);
  }
  @Put('/:salonId')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async operatorUpdateSalon(
    @Param('salonId') salonId: string,
    @Body() dto: OperatorUpdateSalonDto,
  ) {
    return this.salonService.operatorUpdate(salonId, { ...dto });
  }
}
