import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { Role } from '@src/auth/decorators/role.decorator';
import { SalonService } from '@src/salon/services/salon.service';
import { RegisterSalonDto } from '@src/salon/dtos/register-salon.dto';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { ManipulatorType } from '@src/account/schemas/manipulator.schema';
import { Errors } from '@src/salon/contracts/error';
import { AppException } from '@src/common/exceptions/app.exception';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { ManipulatorsBySalonDataResponse } from '@src/account/dtos/manipulators-by-salon.dto';
import { pagination } from '@src/common/decorators/pagination';
import { SalonOwnerParam } from '@src/salon/decorators/salon-owner-param.decorator';
import { UpdateSalonDto } from '@src/salon/dtos/update-salon.dto';
import { SalonItemReponse } from '@src/salon/contracts/openapi';
import { PaginateDto } from '@src/common/dtos/paginate.dto';

@ApiTags('Salon (Manipulator)')
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@Controller('salons')
@ApiBearerAuth()
export class SalonController {
  constructor(
    private salonService: SalonService,
    private maniplulatorService: ManipulatorService,
  ) {}

  @Get('/:salonId')
  @ApiCreatedResponse({ type: SalonItemReponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getSalon(@SalonOwnerParam('salonId') salonId: string) {
    return this.salonService.getSalonById(salonId);
  }

  @Post()
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createSalon(@Body() dto: RegisterSalonDto, @Req() request) {
    const { _id: manipulatorId, type, isNewRegistration } = request.user;
    if (type !== ManipulatorType.OWNER || !isNewRegistration) {
      const { code, message, status } = Errors.CAN_NOT_REGISTER_SALON;
      throw new AppException(code, message, status);
    }

    return this.salonService.create({ ...dto }, manipulatorId);
  }

  @Put('/:salonId')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async updateSalon(
    @SalonOwnerParam('salonId') salonId: string,
    @Body() dto: UpdateSalonDto,
  ) {
    return this.salonService.update(salonId, { ...dto });
  }

  @Get('/:salonId/manipulators')
  @ApiQuery({ type: PaginateDto })
  @ApiOkResponse({ type: ManipulatorsBySalonDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findManipulatorBySalonId(
    @Param('salonId') salonId: string,
    @pagination() paginationParam: PaginateDto,
  ) {
    return this.maniplulatorService.findManipulatorsBySalonId(
      salonId,
      paginationParam,
    );
  }
}
