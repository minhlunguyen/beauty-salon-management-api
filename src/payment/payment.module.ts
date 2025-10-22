import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentMethodsController } from './controllers/customer/payment-methods.controller';
import { VeritransService } from './services/veritrans.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [PaymentService, VeritransService, PaymentRepository],
  exports: [PaymentService],
  controllers: [PaymentMethodsController],
})
export class PaymentModule {}
