import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { ReservationService } from '@src/reservation/services/reservation.service';
import {
  OperatorFindReservationsOutput,
  OperatorGetReservationListInput,
} from '@src/reservation/dtos/get-reservation-list.dto';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { pagination } from '@src/common/decorators/pagination';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import { OperatorReservationDetailResponse } from '@src/reservation/dtos/operator-reservation-detail.dto';
import { ReservationHistoryService } from '@src/reservation/services/reservation-history.service';
import { ReservationHistoryResponse } from '@src/reservation/contracts/openapi';
import { OperatorChangeStatusReservation } from '@src/reservation/dtos/operator-change-status-reservation.dto';
import { OperatorChangeStatusAction } from '@src/reservation/contracts/types';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors as ReservationErrors } from '@src/reservation/contracts/error';
@ApiTags('Reservation (Operator)')
@Controller('operator/reservations')
@UseGuards(Auth0AuthGuard)
@ApiBearerAuth()
export class OperatorReservationController {
  constructor(
    private reservationService: ReservationService,
    private historyService: ReservationHistoryService,
  ) {}
  @Get()
  @ApiQuery({ type: PaginateDto })
  @ApiOkResponse({ type: OperatorFindReservationsOutput })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findReservations(
    @Query() params: OperatorGetReservationListInput,
    @pagination()
    paginateDto: PaginateDto,
  ) {
    const result = await this.reservationService.findReservations(
      params,
      paginateDto,
    );

    return result;
  }

  @Get('/:reservationId([0-9a-f]{24})')
  @ApiOkResponse({ type: OperatorReservationDetailResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservationDetail(@Param('reservationId') reservationId: string) {
    const result = await this.reservationService.findById(reservationId);
    return result;
  }

  @Get('/:reservationId([0-9a-f]{24})/status-changes-history')
  @ApiOkResponse({ type: ReservationHistoryResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getReservationHistory(@Param('reservationId') reservationId: string) {
    const result = await this.historyService.getHistoryByReservationId(
      reservationId,
    );
    return result;
  }

  @Patch('/:reservationId([0-9a-f]{24})/change-status')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async complete(
    @Param('reservationId') reservationId: string,
    @Body() dto: OperatorChangeStatusReservation,
  ) {
    if (dto.action === OperatorChangeStatusAction.COMPLETE) {
      return this.reservationService.operatorCompleteReservation(reservationId);
    } else if (dto.action === OperatorChangeStatusAction.CANCELED) {
      const { code, status, message } = ReservationErrors.CAN_NOT_CANCEL;
      throw new AppException(code, message, status);
    }
  }
}
