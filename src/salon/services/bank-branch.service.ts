import { Injectable } from '@nestjs/common';
import { BankBranchRepository } from '@src/salon/repositories/bank-branch.repository';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { BankDocument } from '../schemas/bank.schema';

@Injectable()
export class BankBranchService {
  constructor(public bankBranchRepository: BankBranchRepository) {}

  /**
   * Get branch list
   *
   * @param {Params} params The params for filter data
   */
  getBranchList<Params extends { bankId: string; keyword?: string }>(
    params?: Params,
  ) {
    const conditions: { bankRef: string; branchName?: any } = {
      bankRef: params.bankId,
    };

    if (params && params.keyword) {
      conditions.branchName = { $regex: params.keyword, $options: 'i' };
    }

    return this.bankBranchRepository.find({
      conditions,
      sort: { branchName: 'asc' },
    });
  }

  /**
   * Find one and update the bank branch
   *
   * @param {FilterQuery<BankDocument>} conditions
   * @param {UpdateQuery<BankDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<BankDocument>,
    data: UpdateQuery<BankDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.bankBranchRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
