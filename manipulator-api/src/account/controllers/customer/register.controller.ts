import { Controller, Body, Post, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SendOtpDto } from '@src/account/dtos/send-otp.dto';
import { VerifyOtpDto } from '@src/account/dtos/verify-otp.dto';
import { OtpService } from '@src/account/services/otp.services';
import { CustomerService } from '@src/account/services/customer.services';
import { CustomerRegisterDto } from '@src/account/dtos/customer-register.dto';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import {
  CustomerRegisterResponse,
  VerifySuccessResponse,
} from '@src/account/contracts/openapi';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@src/common/exceptions/app.exception';

@ApiTags('Customer')
@Controller('customer/register')
export class RegisterController {
  constructor(
    private otpService: OtpService,
    private customerService: CustomerService,
    private configService: ConfigService,
  ) {}

  @Post('/send-otp')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async sendOtp(@Body() otpDto: SendOtpDto) {
    const result = await this.customerService.sendOtpToRegister(otpDto);
    return !!result;
  }

  @Post('/verify-otp')
  @ApiOkResponse({ type: VerifySuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async verifyOtp(@Body() otpDto: VerifyOtpDto) {
    const token = await this.otpService.verifyOtp(otpDto);
    return { token };
  }

  @Post()
  @ApiCreatedResponse({ type: CustomerRegisterResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async register(@Body() registerDto: CustomerRegisterDto) {
    const result = await this.customerService.register(registerDto);
    return result;
  }

  /**
   * This API is made as debugging or testing tool
   * - Be implemented to be suitable with the Slack commands integration
   */
  @Post('/unlink-phone')
  @ApiExcludeEndpoint(true)
  async removePhoneNumber(@Body('text') phone: string) {
    const appEnv = this.configService.get<string>('appEnv');
    if (!['development', 'testing', 'local'].includes(appEnv)) {
      throw new AppException('404', 'Not found', HttpStatus.NOT_FOUND);
    }

    await this.customerService.updateByConditions(
      { phone },
      { phone: `${phone}_${Date.now()}` },
    );

    return `The phone number (${phone}) has been removed successfully.`;
  }
}
