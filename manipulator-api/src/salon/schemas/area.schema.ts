import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type AreaDocument = HydratedDocument<Area>;
@Schema({
  timestamps: true,
})
export class Area {
  @ApiProperty()
  @Prop()
  _id: number;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  name: string;

  @ApiProperty()
  @Prop({
    required: true,
  })
  provinceId: number;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  provinceName: string;
}

export const AreaSchema = SchemaFactory.createForClass(Area);
AreaSchema.plugin(paginate);
