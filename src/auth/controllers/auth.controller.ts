import { Controller, Post, Param, Body, Delete } from '@nestjs/common';
import { HelperService } from '@src/auth/services/helper.service';
import { AuthServiceInterface } from '@src/auth/interfaces/auth-service.interface';
import { LoginDto } from '@src/auth/dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '@src/auth/services/token.services';
import { RefreshToken } from '@src/auth/dtos/refresh-token.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginOtpDto } from '../dtos/login-otp.dto';
import { VerificationService } from '@src/common/services/verification.service';
import { nanoid } from 'nanoid/async';

@Controller()
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private helperService: HelperService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
    private verificationService: VerificationService,
  ) {}

  @Post(':role/login/send-otp')
  async sendOtp(@Param('role') role: string, @Body() otpDto: LoginOtpDto) {
    const roleService: AuthServiceInterface =
      this.helperService.getAuthService(role);
    await roleService.checkUserExisted(otpDto.phoneNumber);

    return this.verificationService.sendVerificationToken(otpDto.phoneNumber);
  }

  @Post(':role/login')
  async login(@Param('role') role: string, @Body() loginDto: LoginDto) {
    const roleService: AuthServiceInterface =
      this.helperService.getAuthService(role);

    const user = await roleService.validateUser(loginDto);
    const expiresIn = this.configService.get('jwtTokenExpiresIn');
    const deviceId = loginDto.deviceId ? loginDto.deviceId : await nanoid();
    const refreshToken = await this.tokenService.createOrUpdateToken({
      role,
      userId: user._id,
      deviceId,
    });
    return {
      accessToken: await this.jwtService.sign(
        { sub: user._id, authRole: role },
        {
          expiresIn,
        },
      ),
      refreshToken: refreshToken.token,
      deviceId,
    };
  }

  @Post('newAccessToken')
  async newAccessToken(@Body() data: RefreshToken) {
    const expiresIn = this.configService.get('jwtTokenExpiresIn');
    const { userId, role } = await this.tokenService.getDataOfToken(data);
    return {
      accessToken: await this.jwtService.sign(
        { sub: userId, authRole: role },
        {
          expiresIn,
        },
      ),
    };
  }

  @Delete('logout')
  async logout(@Body() data: RefreshToken) {
    await this.tokenService.removeTokens(data);
    return {
      status: 'success',
    };
  }
}
