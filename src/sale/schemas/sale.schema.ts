import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ReservationDocument } from '@src/reservation/schemas/reservation.schema';
import { SalonDocument } from '@src/salon/schemas/salon.schema';

export type SaleDocument = HydratedDocument<Sale>;

@Schema({
  timestamps: true,
})
export class Sale {
  @Prop({
    type: Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservation: Types.ObjectId | ReservationDocument;

  @Prop({
    type: Types.ObjectId,
    ref: 'Salon',
    required: true,
  })
  salon: Types.ObjectId | SalonDocument;

  @Prop({
    required: true,
  })
  saleAmount: number;

  @Prop({
    required: true,
  })
  commission: number;

  @Prop({
    required: true,
  })
  profit: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
SaleSchema.plugin(paginate);
