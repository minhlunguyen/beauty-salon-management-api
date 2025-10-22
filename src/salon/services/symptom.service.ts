import { Injectable } from '@nestjs/common';
import { SymptomRepository } from '@src/salon/repositories/symptom.repository';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { SymptomDocument } from '../schemas/symptom.schema';

@Injectable()
export class SymptomService {
  constructor(public symptomRepository: SymptomRepository) {}

  /**
   * Get symptom list
   *
   * @param {Params} params The params for filter data
   */
  getSymptomList<Params extends { type?: number | undefined }>(
    params?: Params,
  ) {
    let conditions = {};
    if (params && params.type) {
      conditions = { typeId: params.type };
    }

    return this.symptomRepository.find({
      conditions,
      selectedFields: ['_id', 'typeId', 'typeName', 'symptomName'],
      sort: { typeId: 'asc' },
    });
  }

  /**
   * Find one and update the symptom
   *
   * @param {FilterQuery<SymptomDocument>} conditions
   * @param {UpdateQuery<SymptomDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<SymptomDocument>,
    data: UpdateQuery<SymptomDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.symptomRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
