import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type BankBranchDocument = HydratedDocument<BankBranch>;
@Schema({
  timestamps: true,
})
export class BankBranch {
  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  _id: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  bankRef: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  branchCode: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  branchNameCode: string;

  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  branchName: string;

  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  telephone: string;

  @ApiProperty()
  @Prop({
    maxlength: 200,
  })
  address: string;

  @ApiProperty()
  @Prop({
    maxlength: 200,
  })
  postalCode: string;

  @ApiProperty()
  @Prop({
    maxlength: 200,
  })
  branchNameHiragana: string;

  @ApiProperty()
  @Prop()
  noMean: number;

  @ApiProperty()
  @Prop()
  noMean2: number;

  @ApiProperty()
  @Prop()
  noMean3: string;
}

export const BankBranchSchema = SchemaFactory.createForClass(BankBranch);
BankBranchSchema.plugin(paginate);
