import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ScheduleTask,
  ScheduleTaskDocument,
} from '../schemas/schedule-task.schema';

@Injectable()
export class ScheduleTaskRepository extends AbstractRepository<ScheduleTaskDocument> {
  constructor(
    @InjectModel(ScheduleTask.name)
    model: PaginateModel<ScheduleTaskDocument>,
  ) {
    super(model);
  }
}
