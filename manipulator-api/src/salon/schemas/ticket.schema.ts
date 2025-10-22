import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type TicketDocument = HydratedDocument<Ticket>;
@Schema({
  timestamps: true,
})
export class Ticket {
  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
    required: true,
  })
  menuId: Types.ObjectId;

  @Prop({
    required: true,
  })
  couponId: number;

  @Prop({
    required: true,
  })
  code: string;

  @Prop({
    required: true,
  })
  price: number;

  @Prop({
    required: true,
  })
  numberOfTicket: number;

  @Prop({
    required: true,
  })
  expiryMonth: number;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.plugin(paginate);
