import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type StationDocument = HydratedDocument<Station>;
@Schema({
  timestamps: true,
})
export class Station {
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
    index: true,
  })
  lineId: number;

  @ApiProperty()
  @Prop({
    index: true,
  })
  groupId: number;
}

export const StationSchema = SchemaFactory.createForClass(Station);
StationSchema.plugin(paginate);
