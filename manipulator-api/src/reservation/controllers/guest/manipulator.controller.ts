import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { GetMenusByManipulatorResponse } from '@src/reservation/dtos/get-menus-by-manipulator.dto';
import { MenuService } from '@src/salon/services/menu.service';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { ManipulatorDetailResponse } from '@src/reservation/dtos/get-manipulator-detail.dto';
import { AvailableBookingSlotsResponse } from '@src/reservation/contracts/openapi';
import { GetAvailableBookingSlotsDto } from '@src/reservation/dtos/get-available-booking-slots.dto';
import { ReservationService } from '@src/reservation/services/reservation.service';

@ApiTags('Reservation (Guest)')
@Controller('manipulators')
export class GuestManipulatorController {
  constructor(
    private menuService: MenuService,
    private manipulator: ManipulatorService,
    private reservationService: ReservationService,
  ) {}

  @Get('/:manipulatorId([0-9a-f]{24})/menus')
  @ApiOkResponse({ type: GetMenusByManipulatorResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getMenusByManipulator(@Param('manipulatorId') manipulatorId: string) {
    const result = await this.menuService.getMenusByManipulatorId(
      manipulatorId,
    );
    return result;
  }

  @Get('/:manipulatorId([0-9a-f]{24})')
  @ApiOkResponse({ type: ManipulatorDetailResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getManipulatorDetail(@Param('manipulatorId') manipulatorId: string) {
    const result = await this.manipulator.getManipulatorDetail(manipulatorId);
    return result;
  }

  @Get('/:manipulatorId([0-9a-f]{24})/get-available-timeslots')
  @ApiOkResponse({ type: AvailableBookingSlotsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getAvailableBookingSlots(
    @Param('manipulatorId') manipulatorId: string,
    @Query() dto: GetAvailableBookingSlotsDto,
  ) {
    return this.reservationService.getAvailableBookingSlots(
      manipulatorId,
      dto.startTime,
      dto.endTime,
    );
  }
}
