import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  TreatmentHistory,
  TreatmentHistoryDocument,
} from '@src/medical/schemas/treatment-history.schema';

@Injectable()
export class TreatmentHistoryRepository extends AbstractRepository<TreatmentHistoryDocument> {
  constructor(
    @InjectModel(TreatmentHistory.name)
    model: PaginateModel<TreatmentHistoryDocument>,
  ) {
    super(model);
  }
}
