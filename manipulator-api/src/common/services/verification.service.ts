import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '../contracts/error';
import { AppLogger } from '@src/common/services/app-logger.service';
import { Twilio } from 'twilio';

const enum ErrorCodes {
  INVALID_PHONE_NUMBER = '60200',
  MAX_SEND_ATTEMPTS = '60203',
  VERIFICATION_CODE_NOT_FOUND = '20404',
  TOO_MANY_REQUEST = '20429',
}
const enum Statuses {
  APPROVED = 'approved',
  PENDING = 'pending',
}

@Injectable()
export class VerificationService {
  private twilioClient: Twilio;

  constructor(
    private configService: ConfigService,
    private loggerService: AppLogger,
  ) {
    const authKey = this.configService.get('twilioAuthKey');
    const authSecret = this.configService.get('twilioAuthSecret');

    this.twilioClient = new Twilio(authKey, authSecret, {
      lazyLoading: true,
      accountSid: authKey.indexOf('AC') === 1 ? authKey : 'AC',
    });
  }

  /**
   * send a verification code to phone number
   *
   * @param {string} phoneNumber
   * @returns
   */
  async sendVerificationToken(phoneNumber: string): Promise<boolean> {
    const serviceId = this.configService.get('twilioVerifyServiceId');
    if (this._isDebugMode()) {
      const twilioTestNumbers = this.configService
        .get<string>('twilioTestNumbers')
        .split(',');
      if (twilioTestNumbers.includes(phoneNumber)) {
        return true;
      }
    }

    try {
      const regularPhoneNumber = this._getRegularPhoneNumber(phoneNumber);
      const result = await this.twilioClient.verify.v2
        .services(serviceId)
        .verifications.create({
          to: regularPhoneNumber,
          channel: 'sms',
        });

      return !!result.sid;
    } catch (error) {
      if (
        [
          ErrorCodes.INVALID_PHONE_NUMBER,
          ErrorCodes.TOO_MANY_REQUEST,
          ErrorCodes.MAX_SEND_ATTEMPTS,
        ].includes(error.code.toString())
      ) {
        throw new AppException(
          error.code.toString(),
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // logging for investigating the occurred error.
      const { message: errorMsg, stack } = error;
      this.loggerService.error(
        errorMsg,
        stack,
        JSON.stringify({ phoneNumber }),
      );

      const { code, message, status } = Errors.CAN_NOT_SEND_VERIFICATION_CODE;
      throw new AppException(code, message, status);
    }
  }

  /**
   * checking a specified verification code is valid
   *
   * @param {string} phoneNumber
   * @param {string} code
   * @returns Promise<boolean>
   */
  async checkVerificationToken(
    phoneNumber: string,
    code: string,
  ): Promise<boolean> {
    const serviceId = this.configService.get('twilioVerifyServiceId');
    if (this._isDebugMode()) {
      const twilioTestCode = this.configService.get<string>('twilioTestCode');
      if (code === twilioTestCode) {
        return true;
      }
    }

    try {
      const result = await this.twilioClient.verify.v2
        .services(serviceId)
        .verificationChecks.create({
          to: this._getRegularPhoneNumber(phoneNumber),
          code: code,
        });

      return result && result.status === Statuses.APPROVED;
    } catch (error) {
      if (error.code.toString() === ErrorCodes.VERIFICATION_CODE_NOT_FOUND) {
        const { code, message, status } = Errors.VERIFICATION_CODE_NOT_FOUND;
        throw new AppException(code, message, status);
      }

      const { code, message, status } = Errors.CAN_NOT_VERIFY_CODE;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Retrieving the phone number which contains country prefix number
   *
   * @param {string} phoneNumber
   * @returns string
   */
  private _getRegularPhoneNumber(phoneNumber: string): string {
    const countryNumber = this.configService.get('twilioCountryNumber');
    return phoneNumber.indexOf(countryNumber) !== -1
      ? phoneNumber
      : `${countryNumber}${phoneNumber}`;
  }

  /**
   * Detect is debug mode
   *
   * @returns boolean
   */
  private _isDebugMode() {
    const appEnv = this.configService.get<string>('appEnv');
    if (!['development', 'testing', 'local'].includes(appEnv)) {
      return false;
    }

    return true;
  }
}
