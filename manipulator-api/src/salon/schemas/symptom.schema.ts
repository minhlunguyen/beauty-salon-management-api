import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type SymptomDocument = HydratedDocument<Symptom>;
@Schema({
  timestamps: true,
})
export class Symptom {
  @ApiProperty()
  @Prop()
  _id: number;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  typeId: number;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  typeName: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 200,
  })
  symptomName: string;
}

export const SymptomSchema = SchemaFactory.createForClass(Symptom);
SymptomSchema.plugin(paginate);
