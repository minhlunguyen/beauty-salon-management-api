import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { TreatmentFile } from '@src/medical/contracts/value-object';

export type TreatmentHistoryDocument = HydratedDocument<TreatmentHistory>;

@Schema({
  timestamps: true,
  collection: 'treatment-histories',
})
export class TreatmentHistory {
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
    ref: 'Reservation',
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
    type: Types.ObjectId,
    ref: 'Manipulator',
    required: true,
  })
  manipulator: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  treatmentInfo: string;

  @ApiProperty()
  @Prop({
    type: TreatmentFile,
  })
  treatmentFile?: TreatmentFile;
}

export const TreatmentHistorySchema =
  SchemaFactory.createForClass(TreatmentHistory);
TreatmentHistorySchema.plugin(paginate);
