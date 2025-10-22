import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { genders } from '../contracts/type';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';

export type CustomerDocument = HydratedDocument<Customer> & {
  createdAt: Date;
  updatedAt: Date;
};
export const statuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  WITHDRAWN: 'WITHDRAWN',
};

@Schema({
  timestamps: true,
})
export class Customer {
  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 100,
  })
  name: string;

  @ApiProperty()
  @Prop({
    maxlength: 100,
  })
  nameKana?: string;

  @ApiProperty()
  @Prop({
    required: true,
  })
  phone: string;

  @ApiProperty()
  @Prop({
    maxlength: 255,
    lowercase: true,
    required: true,
  })
  email: string;

  @ApiProperty()
  @Prop({
    maxlength: 10,
  })
  birthday?: string;

  @ApiProperty()
  @Prop({
    default: genders.NULL,
  })
  gender: number;

  @ApiProperty()
  @Prop({
    default: statuses.ACTIVE,
  })
  status: string;

  @ApiProperty()
  @Prop({
    default: false,
  })
  emailVerified: boolean;

  @ApiProperty()
  @Prop({
    maxlength: 64,
  })
  veritransAccountId?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.plugin(paginate);
