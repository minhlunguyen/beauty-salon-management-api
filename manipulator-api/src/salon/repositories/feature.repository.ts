import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feature, FeatureDocument } from '../schemas/feature.schema';

@Injectable()
export class FeatureRepository extends AbstractRepository<FeatureDocument> {
  constructor(
    @InjectModel(Feature.name) model: PaginateModel<FeatureDocument>,
  ) {
    super(model);
  }
}
