import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ApiProperty } from '@nestjs/swagger';
import { TimeRange } from '../contracts/value-object';

export type DailyScheduleDocument = HydratedDocument<DailySchedule>;

@Schema({
  timestamps: true,
})
export class DailySchedule {
  @ApiProperty()
  @Prop({
    type: Types.ObjectId,
    ref: 'Manipulator',
    required: true,
  })
  manipulatorId: Types.ObjectId;

  @ApiProperty()
  @Prop({
    required: true,
  })
  date: Date;

  @ApiProperty()
  @Prop({
    required: true,
    type: Array<TimeRange>,
    default: [],
  })
  workingTime?: TimeRange[];

  @ApiProperty()
  @Prop({
    default: false,
  })
  isDayOff: boolean;
}

export const DailyScheduleSchema = SchemaFactory.createForClass(DailySchedule);
DailyScheduleSchema.plugin(paginate);
