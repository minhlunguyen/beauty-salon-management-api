import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Bank, BankDocument } from '../schemas/bank.schema';

@Injectable()
export class BankRepository extends AbstractRepository<BankDocument> {
  constructor(@InjectModel(Bank.name) model: PaginateModel<BankDocument>) {
    super(model);
  }
}
