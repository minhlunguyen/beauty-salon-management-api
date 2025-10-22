import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type FeatureDocument = HydratedDocument<Feature>;
@Schema({
  timestamps: true,
})
export class Feature {
  @ApiProperty()
  @Prop()
  _id: number;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  name: string;
}

export const FeatureSchema = SchemaFactory.createForClass(Feature);
FeatureSchema.plugin(paginate);
