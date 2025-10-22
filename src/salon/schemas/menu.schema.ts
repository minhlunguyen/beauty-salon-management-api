import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { MenuTicket } from '../contracts/value-object';
import { Currency, MenuStatus, MenuType } from '../contracts/type';

export type MenuDocument = HydratedDocument<Menu>;
@Schema({
  timestamps: true,
})
export class Menu {
  @ApiProperty()
  @Prop({
    required: true,
    maxlength: 255,
  })
  name: string;

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Salon',
    required: true,
  })
  salonId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: Array<Types.ObjectId>,
    ref: 'Manipulator',
  })
  manipulatorIds?: Types.ObjectId[];

  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Manipulator',
  })
  createdById: Types.ObjectId;

  @ApiProperty()
  @Prop()
  order?: number;

  @ApiProperty()
  @Prop({
    required: true,
  })
  estimatedTime: number;

  @ApiProperty()
  @Prop({
    default: false,
  })
  timeDisplay?: boolean;

  @ApiProperty()
  @Prop({
    required: false,
  })
  price?: number;

  @ApiProperty({ enum: Currency })
  @Prop({
    required: true,
    default: 'JPY',
  })
  currency: Currency;

  @ApiProperty({ type: MenuTicket })
  @Prop({ type: MenuTicket })
  ticket?: MenuTicket;

  @ApiProperty({ enum: MenuType, isArray: true })
  @Prop({
    required: true,
  })
  menuTypes: MenuType[];

  @ApiProperty({ enum: MenuStatus })
  @Prop({
    default: MenuStatus.Private,
  })
  status: MenuStatus;

  @ApiProperty()
  @Prop({
    default: false,
  })
  isDeleted?: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
MenuSchema.plugin(paginate);
