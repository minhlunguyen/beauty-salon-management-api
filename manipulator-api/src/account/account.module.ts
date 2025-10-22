import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Operator, OperatorSchema } from '@src/account/schemas/operator.schema';
import { OperatorRepository } from '@src/account/repositories/operator.repository';
import { OperatorService } from '@src/account/services/operator.services';
import { OperatorController } from '@src/account/controllers/operator/operator.controller';
import { OtpService } from './services/otp.services';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerService } from './services/customer.services';
import { RegisterController as CustomerRegisterController } from './controllers/customer/register.controller';
import { ProfileController as CustomerProfileController } from './controllers/customer/profile.controller';
import { CustomerController as OperatorCustomerController } from './controllers/operator/customer.controller';
import { ManipulatorController as OperatorManipulatorController } from './controllers/operator/manipulator.controller';
import { RegisterController as ManipulatorRegisterController } from './controllers/manipulator/register.controller';
import { ProfileController as ManipulatorProfileController } from './controllers/manipulator/profile.controller';
import { Manipulator, ManipulatorSchema } from './schemas/manipulator.schema';
import { ManipulatorService } from './services/manipulator.services';
import { ManipulatorRepository } from './repositories/manipulator.repository';
import { SalonModule } from '@src/salon/salon.module';
import { NotificationModule } from '@src/notification/notification.module';
import { SearchManipulatorController } from './controllers/common/search-manipulator.controller';
import { PaymentModule } from '@src/payment/payment.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Operator.name, schema: OperatorSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Manipulator.name, schema: ManipulatorSchema },
    ]),
    SalonModule,
    PaymentModule,
    NotificationModule,
  ],
  providers: [
    OperatorRepository,
    OperatorService,
    OtpService,
    CustomerRepository,
    CustomerService,
    ManipulatorService,
    ManipulatorRepository,
  ],
  exports: [
    OperatorRepository,
    OperatorService,
    CustomerRepository,
    CustomerService,
    OtpService,
    ManipulatorService,
    ManipulatorRepository,
  ],
  controllers: [
    OperatorController,
    CustomerRegisterController,
    CustomerProfileController,
    OperatorCustomerController,
    OperatorManipulatorController,
    ManipulatorRegisterController,
    ManipulatorProfileController,
    SearchManipulatorController,
  ],
})
export class AccountModule {}
