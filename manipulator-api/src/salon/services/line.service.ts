import { Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { LineRepository } from '../repositories/line.repository';
import { LineDocument } from '../schemas/line.schema';

@Injectable()
export class LineService {
  constructor(public lineRepository: LineRepository) {}

  /**
   * Get line list
   */
  async getLineList() {
    return this.lineRepository.find({
      conditions: {},
      selectedFields: ['_id', 'name'],
      sort: { name: 'asc' },
    });
  }

  /**
   * Find one and update the line
   *
   * @param {FilterQuery<LineDocument>} conditions
   * @param {UpdateQuery<LineDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<LineDocument>,
    data: UpdateQuery<LineDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.lineRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
