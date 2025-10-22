import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from '@src/app.controller';
import { AuthModule } from '@src/auth/auth.module';
import configuration from '@src/config/app';
import { HealthModule } from '@src/health/health.module';
import { CommandModule } from 'nestjs-command';
import { AccountModule } from './account/account.module';
import { CommonModule } from './common/common.module';
import { CustomerService } from './account/services/customer.services';
import { PaymentModule } from './payment/payment.module';
import { SalonModule } from './salon/salon.module';
import { MediaModule } from '@src/media/media.module';
import { NotificationModule } from './notification/notification.module';
import { ReservationModule } from './reservation/reservation.module';
import { ManipulatorService } from './account/services/manipulator.services';
import { ScheduleModule } from './schedule/schedule.module';
import { SaleModule } from './sale/sale.module';
import { CouponModule } from './coupon/coupon.module';
import { ScheduleModule as CoreScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUrl'),
      }),
    }),
    CommonModule,
    AccountModule,
    CommandModule,
    MediaModule,
    PaymentModule,
    SalonModule,
    NotificationModule,
    ReservationModule,
    ScheduleModule,
    CoreScheduleModule.forRoot(),
    SaleModule,
    CouponModule,
    AuthModule.forRoot([
      {
        role: 'customer',
        service: CustomerService,
      },
      {
        role: 'manipulator',
        service: ManipulatorService,
      },
    ]),
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
      },
      {
        path: 'account',
        module: AccountModule,
      },
      {
        path: 'payment',
        module: PaymentModule,
      },
      {
        path: 'media',
        module: MediaModule,
      },
      {
        path: 'salon',
        module: SalonModule,
      },
      {
        path: 'schedule',
        module: ScheduleModule,
      },
      {
        path: 'reservation',
        module: ReservationModule,
      },
      {
        path: 'sale',
        module: SaleModule,
      },
      {
        path: 'coupon',
        module: CouponModule,
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
