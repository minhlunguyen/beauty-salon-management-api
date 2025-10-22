import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SalonSchedule,
  SalonScheduleDocument,
} from '../schemas/salon-schedule.schema';

@Injectable()
export class SalonScheduleRepository extends AbstractRepository<SalonScheduleDocument> {
  constructor(
    @InjectModel(SalonSchedule.name)
    model: PaginateModel<SalonScheduleDocument>,
  ) {
    super(model);
  }
}
