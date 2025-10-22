import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BankBranch, BankBranchDocument } from '../schemas/bank-branch.schema';

@Injectable()
export class BankBranchRepository extends AbstractRepository<BankBranchDocument> {
  constructor(
    @InjectModel(BankBranch.name)
    model: PaginateModel<BankBranchDocument>,
  ) {
    super(model);
  }
}
