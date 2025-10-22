import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type BankDocument = HydratedDocument<Bank>;
@Schema({
  timestamps: true,
})
export class Bank {
  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  _id: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 200,
  })
  bankName: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 200,
  })
  bankNameCode: string;

  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  bankCode: string;

  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  bankNameHiragana: string;

  @ApiProperty()
  @Prop()
  addedFirstSearchChar: boolean;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
BankSchema.plugin(paginate);
