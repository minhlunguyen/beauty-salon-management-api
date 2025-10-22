import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SalonModule } from '@src/salon/salon.module';
import { CustomerCouponController } from './controllers/customer/coupon.controller';
import { CustomerTicketController } from './controllers/customer/ticket.controller';
import { ManipulatorCouponController } from './controllers/manipulator/coupon.controller';
import { CustomerTicketPaymentRepository } from './repositories/customer-ticket-payment.repository';
import { IssuedTicketRepository } from './repositories/issued-ticket.repository';
import { C2cCouponService } from './services/c2c-coupon.service';
import { CouponService } from './services/coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerTicketPayment,
  CustomerTicketPaymentSchema,
} from './schemas/customer-ticket-payment.schema';
import {
  IssuedTicket,
  IssuedTicketSchema,
} from './schemas/issued-ticket.schema';
import { ManipulatorTicketController } from './controllers/manipulator/ticket.controller';
import { PaymentModule } from '@src/payment/payment.module';
import { TicketService } from './services/ticket.service';

@Global()
@Module({
  imports: [
    JwtModule,
    SalonModule,
    PaymentModule,
    MongooseModule.forFeature([
      { name: CustomerTicketPayment.name, schema: CustomerTicketPaymentSchema },
      { name: IssuedTicket.name, schema: IssuedTicketSchema },
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [
    C2cCouponService,
    CouponService,
    CustomerTicketPaymentRepository,
    IssuedTicketRepository,
    TicketService,
  ],
  exports: [CouponService, TicketService, IssuedTicketRepository],
  controllers: [
    CustomerCouponController,
    ManipulatorCouponController,
    CustomerTicketController,
    ManipulatorTicketController,
  ],
})
export class CouponModule {}
