import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
} from '@src/common/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { GetCustomerTicketBySalonOutput } from '@src/coupon/contracts/openapi';
import { TicketService } from '@src/coupon/services/ticket.service';
import { SalonOwnerParam } from '@src/salon/decorators/salon-owner-param.decorator';

@Controller('manipulator/tickets')
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@ApiTags('Coupon (Manipulator)')
@ApiBearerAuth()
export class ManipulatorTicketController {
  constructor(private ticketService: TicketService) {}

  @Get(':salonId')
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'salonId', required: true })
  @ApiDataOkResponse(GetCustomerTicketBySalonOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getCouponsForBooking(
    @SalonOwnerParam('salonId') salonId: string,
    @pagination() paginateDto: PaginateDto,
    @Query('keyword') keyword?: string,
  ) {
    return this.ticketService.getCustomerTicketBySalon(salonId, {
      limit: paginateDto.limit,
      skip: (paginateDto.page - 1) * paginateDto.limit,
      keyword: keyword,
    });
  }
}
