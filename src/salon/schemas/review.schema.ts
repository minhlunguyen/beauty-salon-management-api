import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;
@Schema({
  timestamps: true,
})
export class Review {
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
    ref: 'Salon',
  })
  salonId?: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Manipulator',
  })
  manipulatorId?: Types.ObjectId;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  title: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 512,
  })
  content: string;

  @ApiProperty()
  @Prop({
    required: true,
  })
  rating: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.plugin(paginate);
