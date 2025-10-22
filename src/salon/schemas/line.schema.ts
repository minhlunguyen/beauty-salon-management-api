import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type LineDocument = HydratedDocument<Line>;
@Schema({
  timestamps: true,
})
export class Line {
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

export const LineSchema = SchemaFactory.createForClass(Line);
LineSchema.plugin(paginate);
