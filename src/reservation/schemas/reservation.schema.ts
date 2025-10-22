import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import {
  CouponInfo,
  PaymentInfo,
  ReservationCustomerInfo,
  ReservationInfo,
  TicketInfo,
} from '@src/reservation/contracts/value-object';
import { ReservationStatus } from '../contracts/types';
import { ManipulatorDocument } from '@src/account/schemas/manipulator.schema';
import { SalonDocument } from '@src/salon/schemas/salon.schema';
import { TreatmentHistory } from '@src/medical/schemas/treatment-history.schema';

export type ReservationDocument = HydratedDocument<Reservation> & {
  createdAt?: Date;
  updatedAt?: Date;
};

@Schema({
  timestamps: true,
})
export class Reservation {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Customer',
  })
  customerId?: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: ReservationCustomerInfo,
    required: true,
  })
  customerInfo: ReservationCustomerInfo;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Manipulator',
    required: true,
  })
  manipulator: Types.ObjectId | ManipulatorDocument;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Salon',
    required: true,
  })
  salon: Types.ObjectId | SalonDocument;

  @ApiProperty()
  @Prop({
    required: true,
  })
  startTime: Date;

  @ApiProperty()
  @Prop({
    required: true,
  })
  endTime: Date;

  @ApiProperty()
  @Prop({
    required: true,
  })
  cancelDeadline: Date;

  @ApiProperty()
  @Prop({
    required: true,
    type: ReservationInfo,
  })
  plan: ReservationInfo;

  @ApiProperty()
  @Prop({
    type: ReservationInfo,
  })
  result: ReservationInfo;

  @ApiProperty()
  @Prop({
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;

  @Prop({
    type: PaymentInfo,
  })
  paymentInfo: PaymentInfo;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'TreatmentHistory',
  })
  treatment?: Types.ObjectId | TreatmentHistory;

  @Prop({
    type: CouponInfo,
  })
  couponInfo?: CouponInfo;

  @Prop({
    type: TicketInfo,
  })
  ticketInfo?: TicketInfo;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.plugin(paginate);
