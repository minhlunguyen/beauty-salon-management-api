import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
  SuccessResponse,
} from '@src/common/contracts/openapi';
import {
  GetTicketForReservationOutput,
  CustomerTicketListOuput,
} from '@src/coupon/contracts/openapi';
import { CustomerBuyTicketDto } from '@src/coupon/dtos/customer-buy-ticket.dto';
import { CouponService } from '@src/coupon/services/coupon.service';
import { TicketService } from '@src/coupon/services/ticket.service';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
@Controller('customer/tickets')
@Role('customer')
@UseGuards(JwtAuthGuard)
@ApiTags('Coupon (Customer)')
@ApiBearerAuth()
export class CustomerTicketController {
  constructor(
    private couponService: CouponService,
    private ticketService: TicketService,
  ) {}

  @Get(':manipulatorId/menu/:menuId')
  @ApiDataOkResponse(GetTicketForReservationOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getCouponsForBooking(
    @Request() req,
    @Param('manipulatorId') manipulatorId: string,
    @Param('menuId') menuId: string,
  ) {
    return this.ticketService.getTicketForReservation(
      req.user._id.toHexString(),
      menuId,
      manipulatorId,
    );
  }
  @Post('/:ticketId/buy-tickets')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async customerBuyTickets(
    @Request() req,
    @Param('ticketId') ticketId: string,
    @Body() dto: CustomerBuyTicketDto,
  ) {
    return this.ticketService.customerBuyTickets(req.user, ticketId, dto);
  }

  @Get()
  @ApiDataOkResponse(CustomerTicketListOuput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getAvailableCoupons(
    @Request() req,
    @pagination() paginateDto: PaginateDto,
  ) {
    return this.ticketService.getCustomerTickets(req.user._id.toHexString(), {
      limit: paginateDto.limit,
      skip: (paginateDto.page - 1) * paginateDto.limit,
    });
  }
}
