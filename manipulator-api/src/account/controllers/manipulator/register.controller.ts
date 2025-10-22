import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { ManipulatorOwnerRegisterDto } from '@src/account/dtos/manipulator-owner-register.dto';
import { ManipulatorRegisterConfirmDto } from '@src/account/dtos/manipulator-register-confirm-dto.dto';
import { ManipulatorNormalRegisterDto } from '@src/account/dtos/manipulator-normal-register.dto';
import { ManipulatorResponse } from '@src/account/contracts/openapi';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { SalonOwnerParam } from '@src/salon/decorators/salon-owner-param.decorator';

@ApiTags('Manipulator')
@Controller('manipulator/register')
export class RegisterController {
  constructor(private manipulatorService: ManipulatorService) {}

  @Post('/verify-email')
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async verifyEmail(@Body() verifyDto: ManipulatorRegisterConfirmDto) {
    const result = await this.manipulatorService.verifyEmail(verifyDto);
    return result;
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async register(@Body() registerDto: ManipulatorOwnerRegisterDto) {
    const result = await this.manipulatorService.registerOwner(registerDto);
    return result;
  }

  @Post(':salonId')
  @UseGuards(JwtAuthGuard)
  @Role('manipulator')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ManipulatorResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiQuery({ name: 'salonId', type: String, required: true })
  async registerNormal(
    @Body() registerNormalDto: ManipulatorNormalRegisterDto,
    @SalonOwnerParam('salonId') salonId: string,
  ) {
    const result = await this.manipulatorService.registerNormal(
      salonId,
      registerNormalDto,
    );
    return result;
  }
}
