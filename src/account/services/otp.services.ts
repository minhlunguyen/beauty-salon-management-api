import { Injectable } from '@nestjs/common';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '../contracts/error';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { VerificationService } from '@src/common/services/verification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private verificationService: VerificationService,
  ) {}

  /**
   * Verifying OTP
   *
   * @param {SendOtpDto} data
   * @returns Promise<boolean>
   */
  public async sendOtp({ phoneNumber }: SendOtpDto): Promise<boolean> {
    return await this.verificationService.sendVerificationToken(phoneNumber);
  }

  /**
   * Verifying OTP
   *
   * @param {VerifyOtpDto} data
   * @returns Promise<string>
   */
  public async verifyOtp({ phoneNumber, code }: VerifyOtpDto): Promise<string> {
    const isValid = await this.verificationService.checkVerificationToken(
      phoneNumber,
      code,
    );

    if (!isValid) {
      const { code, message, status } = Errors.INVALID_VERIFICATION_CODE;
      throw new AppException(code, message, status);
    }

    return this._generateOtpToken(phoneNumber);
  }

  /**
   *
   * Generating a Jwt token for a valid OTP
   *
   * @param {string} phoneNumber
   * @returns
   */
  private async _generateOtpToken(phoneNumber: string): Promise<string> {
    const expiresIn = this.configService.get('jwtOtpTokenExpiresIn');
    return this.jwtService.sign({ phoneNumber }, { expiresIn });
  }

  /**
   * Checking the token is valid
   *
   * @param {string} phoneNumber
   * @param {string} token
   * @returns Promise<boolean>
   */
  async verifyOtpJwtToken(
    phoneNumber: string,
    token: string,
  ): Promise<boolean> {
    const data = await this.jwtService.verify(token);
    return data.phoneNumber === phoneNumber;
  }
}
