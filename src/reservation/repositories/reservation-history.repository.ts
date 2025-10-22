import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ReservationHistory,
  ReservationHistoryDocument,
} from '../schemas/reservation-history.schema';

@Injectable()
export class ReservationHistoryRepository extends AbstractRepository<ReservationHistoryDocument> {
  constructor(
    @InjectModel(ReservationHistory.name)
    model: PaginateModel<ReservationHistoryDocument>,
  ) {
    super(model);
  }
}
