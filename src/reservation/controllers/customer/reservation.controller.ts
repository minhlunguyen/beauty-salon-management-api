import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { CreateReservationResponse } from '@src/reservation/contracts/openapi';
import { CreateReservationDto } from '@src/reservation/dtos/create-reservation.dto';
import { ReservationService } from '@src/reservation/services/reservation.service';
import { pagination } from '@src/common/decorators/pagination';
import { GetReservationsByCustomerResponse } from '@src/reservation/contracts/openapi';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { ReservationDetailResponse } from '@src/reservation/dtos/get-reservation-detail.dto';

@ApiTags('Reservation (Customer)')
@Controller('customer/reservations')
@Role('customer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomerReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get()
  @ApiQuery({ type: PaginateDto })
  @ApiOkResponse({ type: GetReservationsByCustomerResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservationsByCustomer(
    @pagination() paginationParam: PaginateDto,
    @Request() request,
  ) {
    const customerId = request.user._id;
    const result = await this.reservationService.getReservationByCustomer(
      customerId,
      paginationParam,
    );
    return result;
  }

  @Post()
  @ApiOkResponse({ type: CreateReservationResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async create(@Body() dto: CreateReservationDto, @Request() request) {
    return this.reservationService.createNewReservation(request.user, dto);
  }

  @Get('/:reservationId([0-9a-f]{24})')
  @ApiOkResponse({ type: ReservationDetailResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservation(
    @Param('reservationId') reservationId: string,
    @Request() request,
  ) {
    const customerId = request.user._id;
    const result = await this.reservationService.getReservationDetail(
      reservationId,
      customerId,
    );
    return result;
  }
}
