import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type ScheduleTaskDocument = HydratedDocument<ScheduleTask>;

@Schema({
  timestamps: true,
})
export class ScheduleTask {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    default: true,
  })
  isRunning: boolean;

  @Prop({
    default: 'PROCESSING',
  })
  status: string;
}

export const ScheduleTaskSchema = SchemaFactory.createForClass(ScheduleTask);
ScheduleTaskSchema.plugin(paginate);
