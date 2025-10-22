import { Injectable } from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { StationRepository } from '../repositories/station.repository';
import { StationDocument } from '../schemas/station.schema';

@Injectable()
export class StationService {
  constructor(public stationRepository: StationRepository) {}

  /**
   * Get station list
   */
  async getStationList(lineId: number) {
    return this.stationRepository.find({
      conditions: { lineId },
      selectedFields: ['_id', 'name', 'groupId'],
      sort: { name: 'asc' },
    });
  }

  /**
   * Find one and update the station
   *
   * @param {FilterQuery<StationDocument>} conditions
   * @param {UpdateQuery<StationDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<StationDocument>,
    data: UpdateQuery<StationDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.stationRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }
}
