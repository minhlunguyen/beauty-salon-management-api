import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Symptom, SymptomDocument } from '../schemas/symptom.schema';

@Injectable()
export class SymptomRepository extends AbstractRepository<SymptomDocument> {
  constructor(
    @InjectModel(Symptom.name) model: PaginateModel<SymptomDocument>,
  ) {
    super(model);
  }
}
