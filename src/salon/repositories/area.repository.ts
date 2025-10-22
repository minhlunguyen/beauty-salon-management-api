import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Area, AreaDocument } from '../schemas/area.schema';

@Injectable()
export class AreaRepository extends AbstractRepository<AreaDocument> {
  constructor(@InjectModel(Area.name) model: PaginateModel<AreaDocument>) {
    super(model);
  }
}
