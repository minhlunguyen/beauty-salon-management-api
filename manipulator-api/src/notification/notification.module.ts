import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerService } from './services/mailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('smtpHost'),
          port: configService.get<number>('smtpPort'),
          ignoreTLS: false,
          secure: true,
          auth: {
            user: configService.get<string>('smtpUsername'),
            pass: configService.get<string>('smtpPassword'),
          },
        },
        defaults: {
          from: `"${configService.get<string>(
            'smtpFromName',
          )}" <${configService.get<string>('smtpFromEmail')}>`,
        },
        template: {
          dir: __dirname + '/mail/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class NotificationModule {}
