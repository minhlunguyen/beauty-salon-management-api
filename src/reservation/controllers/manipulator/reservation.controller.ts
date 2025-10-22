import {
  Body,
  Controller,
  Param,
  Put,
  Request,
  UseGuards,
  Get,
  Query,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { CompleteReservationDto } from '@src/reservation/dtos/complete-reservation.dto';
import { ReservationService } from '@src/reservation/services/reservation.service';
import { ReservationDetailResponse } from '@src/reservation/dtos/get-reservation-detail.dto';
import {
  ReservationListResponse,
  GetReservationListDto,
} from '@src/reservation/dtos/get-reservation-list.dto';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { pagination } from '@src/common/decorators/pagination';
import { CreateNextReservationDto } from '@src/reservation/dtos/create-next-reservation.dto';

@ApiTags('Reservation (Manipulator)')
@Controller('manipulator/reservations')
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ManipulatorReservationController {
  constructor(private reservationService: ReservationService) {}

  @Get('/:reservationId([0-9a-f]{24})')
  @ApiOkResponse({ type: ReservationDetailResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservation(
    @Param('reservationId') reservationId: string,
    @Request() request,
  ) {
    const manipulatorId = request.user._id;
    const result =
      await this.reservationService.getReservationDetailByManipulator(
        reservationId,
        manipulatorId,
      );
    return result;
  }

  @Get()
  @ApiOkResponse({ type: ReservationListResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservationList(
    @Request() request,
    @pagination() paginateDto: PaginateDto,
    @Query() listDto: GetReservationListDto,
  ) {
    const manipulatorId = request.user._id;
    const result =
      await this.reservationService.getReservationListByManipulator(
        manipulatorId,
        listDto.date,
        paginateDto,
      );
    return result;
  }

  @Put('/:reservationId([0-9a-f]{24})/complete')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async complete(
    @Param('reservationId') reservationId: string,
    @Body() dto: CompleteReservationDto,
    @Request() request,
  ) {
    const loggedManipulator = request.user;
    return this.reservationService.completeReservation(
      reservationId,
      dto,
      loggedManipulator,
    );
  }

  @Post('/:reservationId([0-9a-f]{24})/next-reservation')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createNextReservation(
    @Param('reservationId') reservationId: string,
    @Body() dto: CreateNextReservationDto,
    @Request() request,
  ) {
    return this.reservationService.createNextReservation(
      reservationId,
      dto,
      request.user,
    );
  }
}
