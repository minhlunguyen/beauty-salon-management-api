import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalonModule } from '@src/salon/salon.module';
import { CustomerReservationController } from './controllers/customer/reservation.controller';
import { GuestManipulatorController } from './controllers/guest/manipulator.controller';
import { ReservationRepository } from './repositories/reservation.repository';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { ReservationService } from './services/reservation.service';
import { PaymentModule } from '@src/payment/payment.module';
import { NotificationModule } from '@src/notification/notification.module';
import { ManipulatorReservationController } from './controllers/manipulator/reservation.controller';
import { OperatorReservationController } from './controllers/operator/reservation.controller';
import { MedicalModule } from '@src/medical/medical.module';
import {
  ReservationHistory,
  ReservationHistorySchema,
} from './schemas/reservation-history.schema';
import { ReservationHistoryRepository } from './repositories/reservation-history.repository';
import { ReservationHistoryService } from './services/reservation-history.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: ReservationHistory.name, schema: ReservationHistorySchema },
    ]),
    SalonModule,
    PaymentModule,
    NotificationModule,
    MedicalModule,
  ],
  providers: [
    ReservationRepository,
    ReservationService,
    ReservationHistoryRepository,
    ReservationHistoryService,
  ],
  controllers: [
    GuestManipulatorController,
    CustomerReservationController,
    ManipulatorReservationController,
    OperatorReservationController,
  ],
  exports: [
    ReservationRepository,
    ReservationService,
    ReservationHistoryService,
  ],
})
export class ReservationModule {}
