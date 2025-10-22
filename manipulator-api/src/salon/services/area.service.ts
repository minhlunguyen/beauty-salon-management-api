import { Injectable } from '@nestjs/common';
import {
  FilterQuery,
  QueryOptions,
  UpdateQuery,
  PipelineStage,
} from 'mongoose';
import { AreaDocument } from '../schemas/area.schema';
import { AreaRepository } from '../repositories/area.repository';

@Injectable()
export class AreaService {
  constructor(public areaRepository: AreaRepository) {}

  /**
   * Get area list
   */
  async getAreaListByProvince(provinceId: number) {
    return this.areaRepository.find({
      conditions: { provinceId: provinceId },
      selectedFields: ['_id', 'name', 'provinceId', 'provinceName'],
      sort: { _id: 'asc' },
    });
  }

  /**
   * Find one and update the area
   *
   * @param {FilterQuery<AreaDocument>} conditions
   * @param {UpdateQuery<AreaDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<AreaDocument>,
    data: UpdateQuery<AreaDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.areaRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
  /**
   * Get province list
   * @returns
   */
  async getProvinceList() {
    const pipeline: PipelineStage[] = [];
    pipeline.push({
      $group: {
        _id: '$provinceId',
        provinceId: { $first: '$provinceId' },
        provinceName: { $first: '$provinceName' },
      },
    });
    return this.areaRepository.model.aggregate(pipeline);
  }
}
