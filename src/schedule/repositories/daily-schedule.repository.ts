import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DailySchedule,
  DailyScheduleDocument,
} from '../schemas/daily-schedule.schema';

@Injectable()
export class DailyScheduleRepository extends AbstractRepository<DailyScheduleDocument> {
  constructor(
    @InjectModel(DailySchedule.name)
    model: PaginateModel<DailyScheduleDocument>,
  ) {
    super(model);
  }
}
