import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
export type CustomerTicketPaymentDocument =
  HydratedDocument<CustomerTicketPayment>;

@Schema({
  timestamps: true,
})
export class CustomerTicketPayment {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Customer',
    required: true,
  })
  customerId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Ticket',
    required: true,
  })
  ticketId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
    required: true,
  })
  menuId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
    required: true,
  })
  salonId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    required: true,
  })
  amount: number;

  @ApiProperty()
  @Prop({
    required: true,
  })
  paymentTransactionId: string;
}

export const CustomerTicketPaymentSchema = SchemaFactory.createForClass(
  CustomerTicketPayment,
);
CustomerTicketPaymentSchema.plugin(paginate);
