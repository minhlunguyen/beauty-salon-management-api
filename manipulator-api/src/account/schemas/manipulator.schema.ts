import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import {
  BusinessHour,
  MenuInfo,
  Photo,
  ReviewRating,
  SalonInfo,
  Symptom,
} from '@src/salon/contracts/value-object';
import { NationalLicense } from '../contracts/type';

export type ManipulatorDocument = HydratedDocument<Manipulator>;
export const statuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  WITHDRAWN: 'WITHDRAWN',
};

export const ManipulatorType = {
  OWNER: 'Owner',
  NORMAL: 'Normal',
};

@Schema({
  timestamps: true,
})
export class Manipulator {
  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  name?: string;

  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  nameKana?: string;

  @ApiProperty()
  @Prop({
    maxlength: 255,
    lowercase: true,
    required: true,
  })
  email: string;

  @ApiProperty()
  @Prop({
    maxlength: 255,
  })
  password?: string;

  @ApiProperty({ isArray: true, type: SalonInfo })
  @Prop({
    type: Types.Array<SalonInfo>,
  })
  salon?: SalonInfo[];

  @ApiProperty({ isArray: true, type: Symptom })
  @Prop({
    type: Types.Array<Symptom>,
    ref: 'Symptom',
  })
  supportedSymptoms?: Symptom[];

  @ApiProperty()
  @Prop({
    default: statuses.ACTIVE,
  })
  status: string;

  @ApiProperty()
  @Prop({
    default: ManipulatorType.NORMAL,
  })
  type: string;

  @ApiProperty()
  @Prop({
    default: false,
  })
  isPublished?: boolean;

  @ApiProperty()
  @Prop({
    maxlength: 8,
  })
  careerStart?: string;

  @ApiProperty({ isArray: true, type: String })
  @Prop({
    type: Types.Array<NationalLicense>,
  })
  nationalLicenses?: NationalLicense[];

  @ApiProperty()
  @Prop({
    maxlength: 200,
  })
  pr?: string;

  @ApiProperty()
  @Prop({
    maxlength: 500,
  })
  profile?: string;

  @ApiProperty({ isArray: true, type: Photo })
  @Prop({
    type: Types.Array<Photo>,
  })
  photos?: Photo[];

  @ApiProperty({ isArray: true, type: BusinessHour })
  @Prop({
    type: Types.Array<BusinessHour>,
  })
  defaultShifts?: BusinessHour[];

  @ApiProperty()
  @Prop({
    default: { total: 0, averageRating: 0 },
    type: ReviewRating,
  })
  reviewRating?: ReviewRating;

  @ApiProperty({ isArray: true, type: MenuInfo })
  @Prop({
    default: [],
    type: Types.Array<MenuInfo>,
  })
  menus?: MenuInfo[];

  @ApiProperty()
  @Prop({
    default: true,
  })
  isNewRegistration?: boolean;
}

export const ManipulatorSchema = SchemaFactory.createForClass(Manipulator);
ManipulatorSchema.plugin(paginate);
