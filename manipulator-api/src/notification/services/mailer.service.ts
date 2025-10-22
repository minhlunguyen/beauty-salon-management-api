import { Injectable } from '@nestjs/common';
import { MailerService as MailService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: MailService) {}

  async sendRegisterConfirmation(toEmail: string, url: string) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'メールアドレスを確認してください',
      template: './manipulator-register',
      context: {
        url,
      },
    });
  }

  /**
   * Send email to notify the reservation has submitted successful
   *
   * @param {IData} data
   */
  async sendEmailForReservationCreated<
    IData extends { email: string; name: string; url: string },
  >(data: IData) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'ご予約を受け付けました',
        template: './customer-reservation-reserved',
        context: {
          url: data.url,
          name: data.name,
        },
      });
    } catch (err) {
      // do nothing
    }
  }

  /**
   * Send email to notify the reservation has completed
   *
   * @param {IData} data
   */
  async sendEmailForReservationDone<
    IData extends {
      email: string;
      url: string;
      customerName: string;
      salonName: string;
      manipulatorName: string;
    },
  >(data: IData) {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'ご利用ありがとうございました',
        template: './customer-reservation-done',
        context: {
          url: data.url,
          customerName: data.customerName,
          salonName: data.salonName,
          manipulatorName: data.manipulatorName,
        },
      });
    } catch (err) {
      // do nothing
    }
  }

  /**
   * Sending the confirmation email
   *
   * @param {string} toEmail
   * @param {string} url
   */
  async sendNewEmailConfirmation(toEmail: string, url: string) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'メールアドレスを変更してください',
      template: './manipulator-new-email',
      context: {
        url,
      },
    });
  }

  /**
   * Sending the confirmation email to normal manipulator
   *
   * @param {string} toEmail
   * @param {string} url
   */
  async sendRegisterConfirmationForNormal(toEmail: string, url: string) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: 'メールアドレスを確認してください',
      template: './manipulator-register-normal',
      context: {
        url,
      },
    });
  }
}
