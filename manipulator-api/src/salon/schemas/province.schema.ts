import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type ProvinceDocument = HydratedDocument<Province>;
@Schema({
  timestamps: true,
})
export class Province {
  @ApiProperty()
  @Prop()
  _id: number;

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

export const ProvinceSchema = SchemaFactory.createForClass(Province);
ProvinceSchema.plugin(paginate);
