import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { IssuedTicketStatus } from '../contracts/interfaces';
export type IssuedTicketDocument = HydratedDocument<IssuedTicket>;

@Schema({
  timestamps: true,
})
export class IssuedTicket {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Customer',
  })
  customerId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Ticket',
  })
  ticketId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Salon',
  })
  salonId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'CustomerTicketPayment',
  })
  customerTicketPaymentId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Menu',
  })
  menuId: Types.ObjectId;

  @Prop({
    required: true,
  })
  couponIssuedId: number;

  @Prop({
    required: true,
  })
  status: IssuedTicketStatus;

  @Prop({
    required: true,
  })
  expiredAt: Date;
}

export const IssuedTicketSchema = SchemaFactory.createForClass(IssuedTicket);
IssuedTicketSchema.plugin(paginate);
