import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Operator,
  OperatorDocument,
} from '@src/account/schemas/operator.schema';

@Injectable()
export class OperatorRepository extends AbstractRepository<OperatorDocument> {
  constructor(
    @InjectModel(Operator.name) model: PaginateModel<OperatorDocument>,
  ) {
    super(model);
  }
}
