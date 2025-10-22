import { Injectable } from '@nestjs/common';
import { BankRepository } from '@src/salon/repositories/bank.repository';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { BankDocument } from '../schemas/bank.schema';

@Injectable()
export class BankService {
  constructor(public bankRepository: BankRepository) {}

  /**
   * Get bank list
   */
  async getBankList() {
    return this.bankRepository.find({
      conditions: {},
      sort: { bankName: 'asc' },
    });
  }

  /**
   * Find one and update the bank
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
    return await this.bankRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
