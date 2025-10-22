import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
} from '@src/common/contracts/openapi';
import {
  ManipulatorDailyScheduleResponse,
  ScheduleListResponse,
} from '@src/schedule/contracts/openapi';
import { GetSchedulesDto } from '@src/schedule/dtos/get-schedules.dto';
import { DailyScheduleService } from '@src/schedule/services/daily-schedule.service';
import { SalonOwnerParam } from '@src/salon/decorators/salon-owner-param.decorator';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { GetManipulatorScheduleDto } from '@src/schedule/dtos/get-manipulator-schedule.dto';
import { UpdateManipulatorDailyScheduleDto } from '@src/schedule/dtos/update-manipulator-schedule.dto';
import { SalonScheduleService } from '@src/schedule/services/salon-schedule.service';
import { GetSalonScheduleDto } from '@src/schedule/dtos/get-salon-schedule.dto';
import { SalonDailyScheduleResult } from '@src/schedule/contracts/type';

@ApiTags('Schedules (Manipulator)')
@Controller()
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(
    private scheduleService: DailyScheduleService,
    private salonScheduleService: SalonScheduleService,
  ) {}

  @Get(':salonId([0-9a-f]{24})/daily-schedules')
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiQuery({ type: PaginateDto })
  @ApiOkResponse({ type: ScheduleListResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getSchedules(
    @SalonOwnerParam('salonId') salonId: string,
    @pagination() paginateDto: PaginateDto,
    @Query() dto: GetSchedulesDto,
  ) {
    return this.scheduleService.getDailySchedules({
      salonId,
      selectedDate: dto.date,
      ...paginateDto,
    });
  }

  @Get(':salonId([0-9a-f]{24})/schedules-within-date')
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiDataOkResponse(SalonDailyScheduleResult)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getSalonDailySchedule(
    @SalonOwnerParam('salonId') salonId: string,
    @Query() dto: GetSalonScheduleDto,
  ) {
    return this.salonScheduleService.getSalonDailySchedule(salonId, dto.date);
  }

  @Put(':salonId([0-9a-f]{24})/schedules-within-date')
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiDataOkResponse(SalonDailyScheduleResult)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async updateSalonDailySchedule(
    @SalonOwnerParam('salonId') salonId: string,
    @Body() dto: UpdateManipulatorDailyScheduleDto,
  ) {
    return this.salonScheduleService.updateSalonSchedule(salonId, dto);
  }

  @Get(':salonId([0-9a-f]{24})/schedules-within-date/:manId([0-9a-f]{24})')
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiOkResponse({ type: ManipulatorDailyScheduleResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getMyDailySchedule(
    @SalonOwnerParam('salonId') salonId: string,
    @Param('manId') manId: string,
    @Query() dto: GetManipulatorScheduleDto,
  ) {
    return this.scheduleService.getManipulatorDailySchedule(
      salonId,
      manId,
      dto.date,
    );
  }

  @Put(':salonId([0-9a-f]{24})/schedules-within-date/:manId([0-9a-f]{24})')
  @ApiQuery({ name: 'salonId', type: String, required: true })
  @ApiOkResponse({ type: ManipulatorDailyScheduleResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async updateMyDailySchedule(
    @SalonOwnerParam('salonId') salonId: string,
    @Param('manId') manId: string,
    @Body() dto: UpdateManipulatorDailyScheduleDto,
  ) {
    return this.scheduleService.updateManipulatorSchedule(salonId, manId, dto);
  }
}
