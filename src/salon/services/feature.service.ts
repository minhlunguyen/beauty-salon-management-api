import { Injectable } from '@nestjs/common';
import { FeatureRepository } from '@src/salon/repositories/feature.repository';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { FeatureDocument } from '../schemas/feature.schema';

@Injectable()
export class FeatureService {
  constructor(public featureRepository: FeatureRepository) {}

  /**
   * Get feature list
   */
  getFeatureList() {
    return this.featureRepository.find({
      conditions: {},
      selectedFields: ['_id', 'featureId', 'name'],
      sort: { featureId: 'asc' },
    });
  }

  /**
   * Find one and update the features
   *
   * @param {FilterQuery<FeatureDocument>} conditions
   * @param {UpdateQuery<FeatureDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<FeatureDocument>,
    data: UpdateQuery<FeatureDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.featureRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
