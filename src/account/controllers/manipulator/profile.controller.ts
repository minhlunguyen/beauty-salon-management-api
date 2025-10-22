import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { ManipulatorUpdateDto } from '@src/account/dtos/manipulator-update.dto';
import { ManipulatorResponse } from '@src/account/contracts/openapi';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { ManipulatorConfirmNewEmailDto } from '@src/account/dtos/manipulator-confirm-new-email.dto';
import { ManipulatorChangeEmailDto } from '@src/account/dtos/manipulator-change-email.dto';

@ApiTags('Manipulator')
@Controller('manipulator/profile')
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private manipulatorService: ManipulatorService) {}

  @Get()
  @ApiOkResponse({ type: ManipulatorResponse })
  async myInfo(@Request() request) {
    return request.user;
  }

  @Patch()
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async update(@Body() updateDto: ManipulatorUpdateDto, @Request() request) {
    const manipulatorId = request.user._id;
    const result = await this.manipulatorService.update(
      manipulatorId,
      updateDto,
    );
    return result;
  }

  @Post('/confirm-new-email')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async changeEmailConfirmation(
    @Body() data: ManipulatorConfirmNewEmailDto,
    @Request() request,
  ) {
    const manipulatorId = request.user._id;
    const result = await this.manipulatorService.sendNewEmailConfirmation(
      manipulatorId,
      data,
    );
    return result;
  }

  @Patch('/change-email')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async changeEmail(
    @Body() data: ManipulatorChangeEmailDto,
    @Request() request,
  ) {
    return this.manipulatorService.changeManipulatorEmail(
      data,
      request.user._id.toHexString(),
    );
  }
}
