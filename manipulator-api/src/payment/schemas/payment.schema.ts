import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import {
  PaymentMethodStatuses,
  PaymentMethodTypes,
} from '@src/payment/contracts/type';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  timestamps: true,
})
export class Payment {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Salon',
    required: true,
  })
  salon: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Reservertion',
    required: true,
  })
  reservation: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Customer',
    required: true,
  })
  customer: Types.ObjectId;

  @ApiProperty()
  @Prop({
    required: true,
  })
  transactionId: string;

  @ApiProperty()
  @Prop()
  veritransTransactionId?: string;

  @ApiProperty()
  @Prop({
    required: true,
  })
  paymentMethod: string;

  @ApiProperty()
  @Prop()
  cardNumber?: string;

  @ApiProperty()
  @Prop({ required: true })
  extAccountId: string;

  @ApiProperty()
  @Prop({
    required: true,
    default: PaymentMethodTypes.CARD,
  })
  paymentMethodType: PaymentMethodTypes;

  @ApiProperty()
  @Prop({ required: true })
  amount: number;

  @ApiProperty()
  @Prop({
    required: true,
    default: PaymentMethodStatuses.DRAFT,
  })
  status: PaymentMethodStatuses;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.plugin(paginate);
