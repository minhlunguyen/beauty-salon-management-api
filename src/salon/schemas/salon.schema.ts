import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import {
  Address,
  BankInfo,
  BusinessHour,
  Feature,
  Photo,
  ReviewRating,
} from '../contracts/value-object';
import { ManipulatorDocument } from '@src/account/schemas/manipulator.schema';
import { SalonStatus } from '../contracts/type';

export type SalonDocument = HydratedDocument<Salon>;
@Schema({
  timestamps: true,
})
export class Salon {
  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  name: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  nameKana: string;

  @ApiProperty()
  @Prop({
    maxlength: 20,
  })
  phone: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  zipcode?: string;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Manipulator',
  })
  owner?: Types.ObjectId | ManipulatorDocument;

  @ApiProperty({ isArray: true, type: Address })
  @Prop({
    type: Types.Array<Address>,
  })
  addresses?: Address[];

  @ApiProperty({ isArray: true, type: String })
  @Prop({
    type: Types.Array<string>,
  })
  access?: string[];

  @ApiProperty({ isArray: true, type: Feature })
  @Prop({
    type: Types.Array<Feature>,
  })
  features?: Feature[];

  @ApiProperty({ isArray: true, type: Photo })
  @Prop({
    type: Types.Array<Photo>,
  })
  photos?: Photo[];

  @ApiProperty()
  @Prop({})
  description?: string;

  @ApiProperty({ type: BankInfo })
  @Prop({
    type: BankInfo,
  })
  bankInfo?: BankInfo;

  @ApiProperty({ isArray: true, type: BusinessHour })
  @Prop({
    type: Types.Array<BusinessHour>,
  })
  businessHours?: BusinessHour[];

  @ApiProperty()
  @Prop({
    default: false,
  })
  isPublished?: boolean;

  @ApiProperty()
  @Prop({
    default: { total: 0, averageRating: 0 },
    type: ReviewRating,
  })
  reviewRating?: ReviewRating;

  @ApiProperty()
  @Prop({
    default: SalonStatus.VALID,
  })
  status?: SalonStatus;
}

export const SalonSchema = SchemaFactory.createForClass(Salon);
SalonSchema.plugin(paginate);
