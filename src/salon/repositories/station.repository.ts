import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Station, StationDocument } from '../schemas/station.schema';

@Injectable()
export class StationRepository extends AbstractRepository<StationDocument> {
  constructor(
    @InjectModel(Station.name) model: PaginateModel<StationDocument>,
  ) {
    super(model);
  }
}
