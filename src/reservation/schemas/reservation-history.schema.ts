import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationInfo } from '@src/reservation/contracts/value-object';
import { ReservationStatus } from '../contracts/types';
import { ReservationDocument } from './reservation.schema';

export type ReservationHistoryDocument = HydratedDocument<ReservationHistory>;

@Schema({
  timestamps: true,
  collection: 'reservation-history',
})
export class ReservationHistory {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation: Types.ObjectId | ReservationDocument;

  @ApiProperty()
  @Prop({
    type: ReservationInfo,
  })
  data: ReservationInfo;

  @ApiProperty()
  @Prop({
    default: ReservationStatus.RESERVED,
  })
  status: ReservationStatus;
}

export const ReservationHistorySchema =
  SchemaFactory.createForClass(ReservationHistory);
ReservationHistorySchema.plugin(paginate);
