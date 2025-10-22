import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Line, LineDocument } from '../schemas/line.schema';

@Injectable()
export class LineRepository extends AbstractRepository<LineDocument> {
  constructor(@InjectModel(Line.name) model: PaginateModel<LineDocument>) {
    super(model);
  }
}
