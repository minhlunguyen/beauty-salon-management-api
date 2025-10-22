import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, PaginateResult, PipelineStage, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Manipulator,
  ManipulatorDocument,
  statuses,
} from '../schemas/manipulator.schema';
import { isEmpty as _isEmpty } from 'lodash';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { MenuStatus } from '@src/salon/contracts/type';

@Injectable()
export class ManipulatorRepository extends AbstractRepository<ManipulatorDocument> {
  constructor(
    @InjectModel(Manipulator.name) model: PaginateModel<ManipulatorDocument>,
    private dateUtilService: DateUtilService,
  ) {
    super(model);
  }

  /**
   * Search the manipulators rely on parameter
   *
   * @param {SearchParam} params
   * @returns
   */
  async search<
    SearchParam extends {
      date?: Date;
      keyword?: string;
      symptoms?: number[];
      limit?: number;
      skip?: number;
    },
  >(params: SearchParam) {
    let symptomConds: Record<any, any> = {};
    if (params.symptoms) {
      symptomConds = {
        supportedSymptoms: {
          $elemMatch: { id: { $in: params.symptoms } },
        },
      };
    }

    let keywordConds: Record<any, any> = {};
    if (params.keyword) {
      keywordConds = {
        $or: [
          { name: { $regex: params.keyword, $options: 'i' } },
          { nameKana: { $regex: params.keyword, $options: 'i' } },
          { 'salon.name': { $regex: params.keyword, $options: 'i' } },
          { 'salon.nameKana': { $regex: params.keyword, $options: 'i' } },
        ],
      };
    }

    const weekDay = this.dateUtilService.getTzWeekDay(params.date);
    const dateConds = {
      // the salon is not be in the day off
      'salon.businessHours': {
        $elemMatch: {
          weekDay: weekDay,
          isHoliday: false,
        },
      },

      // the manipulator is not be in the day off
      defaultShifts: {
        $elemMatch: {
          weekDay: weekDay,
          isHoliday: false,
        },
      },
    };

    const matchStatement: Record<any, any> = {
      ...dateConds,
      ...symptomConds,
      ...keywordConds,
    };

    // pushing the filter conditions
    const pipeline: PipelineStage[] = [];
    !_isEmpty(matchStatement) &&
      pipeline.push({
        $match: matchStatement,
      });

    // pagination and populating embed data
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        docs: [
          // limit the data after filtering
          { $skip: params.skip },
          { $limit: params.limit },
          // exposing the specified data
          {
            $project: {
              name: 1,
              nameKana: 1,
              pr: 1,
              profile: 1,
              careerStart: 1,
              photo: 1,
              nationalLicenses: 1,
              salons: 1,
              symptoms: '$supportedSymptoms',
            },
          },
        ],
      },
    });

    return this.aggregate(pipeline)
      .project({
        totalDocs: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        docs: 1,
      })
      .exec();
  }

  /**
   * Search the manipulators rely on parameter
   *
   * @param {SearchParam} params
   * @returns
   */
  async findMatchingManipulators<
    SearchParam extends {
      notIn?: string[];
      keyword?: string;
      symptoms?: number[];
      stations?: number[];
      areas?: number[];
      stationGroups?: number[];
    },
  >(params: SearchParam, { page, limit, sort }) {
    let symptomConds: Record<any, any> = {};
    let stationConds: Record<any, any> = {};
    let stationGroupConds: Record<any, any> = {};
    let areaConds: Record<any, any> = {};
    let notInConds: Record<any, any> = {};

    if (params.symptoms) {
      symptomConds = {
        supportedSymptoms: {
          $elemMatch: { id: { $in: params.symptoms } },
        },
      };
    }
    let keywordConds: Record<any, any> = {};
    if (params.keyword) {
      keywordConds = {
        $or: [
          { name: { $regex: params.keyword, $options: 'i' } },
          { nameKana: { $regex: params.keyword, $options: 'i' } },
          { 'salon.name': { $regex: params.keyword, $options: 'i' } },
          { 'salon.nameKana': { $regex: params.keyword, $options: 'i' } },
        ],
      };
    }
    if (params.stations && params.stations.length) {
      stationConds = {
        'salon.addresses.stationIds': { $elemMatch: { $in: params.stations } },
      };
    }

    if (params.stationGroups && params.stationGroups.length) {
      stationGroupConds = {
        'salon.addresses.stations.groupId': { $in: params.stationGroups },
      };
    }

    if (params.areas && params.areas.length) {
      areaConds = {
        'salon.addresses.areaId': { $in: params.areas },
      };
    }

    if (params.notIn && params.notIn.length) {
      notInConds = {
        _id: { $nin: params.notIn.map((id) => new Types.ObjectId(id)) },
      };
    }

    const matchStatement: Record<any, any> = {
      status: statuses.ACTIVE,
      // the manipulators must be assigned at least one public menu
      menus: {
        $exists: true,
        $type: 'array',
        $elemMatch: { status: { $eq: MenuStatus.Public } },
      },
      ...notInConds,
      ...symptomConds,
      ...keywordConds,
      ...stationConds,
      ...stationGroupConds,
      ...areaConds,
    };

    return this.pagination({
      conditions: matchStatement,
      select: [
        'name',
        'nameKana',
        'pr',
        'profile',
        'careerStart',
        'photos',
        'nationalLicenses',
        'salon',
        'supportedSymptoms',
        'menus',
        'reviewRating',
      ],
      limit,
      page,
      sort,
    });
  }

  /**
   * Get manipulators list by specified salon
   *
   * @param {string} salonId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<PaginateResult<ManipulatorDocument>>}
   */
  async getManipulatorBySalonId(
    salonId: string,
    page = 1,
    limit = 5,
    sort = { createdAt: -1 } as Record<string, any>,
  ): Promise<PaginateResult<ManipulatorDocument>> {
    return this.pagination({
      conditions: {
        status: statuses.ACTIVE,
        salon: {
          $elemMatch: {
            salonId: new Types.ObjectId(salonId),
          },
        },
      },
      select: ['_id', 'name', 'nameKana', 'defaultShifts'],
      sort,
      page,
      limit,
    });
  }

  /**
   * Get manipulators which hashed by ids
   *
   * @param {string[]} manipulatorIds
   * @returns {Promise<Map<string, ManipulatorDocument>>}
   */
  async getManipulatorsHashByIds(
    manipulatorIds: string[],
    selectedFields = ['_id', 'name', 'nameKana', 'menus'],
  ): Promise<Map<string, ManipulatorDocument>> {
    const manipulators = await this.find({
      conditions: {
        _id: manipulatorIds.map((id) => new Types.ObjectId(id)),
      },
      selectedFields: selectedFields,
    });

    const result = new Map<string, ManipulatorDocument>();
    for (const manipulator of manipulators) {
      result.set(manipulator._id.toHexString(), manipulator);
    }

    return result;
  }
}
