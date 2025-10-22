import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, PipelineStage } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Salon, SalonDocument } from '../schemas/salon.schema';
import { get as _get } from 'lodash';
import { SortType } from '@src/common/contracts/type';
import { DateUtilService } from '@src/common/services/date-utils.service';

@Injectable()
export class SalonRepository extends AbstractRepository<SalonDocument> {
  constructor(
    @InjectModel(Salon.name) model: PaginateModel<SalonDocument>,
    private readonly dateUtilService: DateUtilService,
  ) {
    super(model);
  }

  /**
   * return the list of salon base on filter conditions
   *
   * @param {IParam} params
   */
  async search<
    IParam extends {
      keyword?: string;
      from?: Date;
      to?: Date;
      status?: string[];
      skip?: number;
      limit?: number;
      sort?: SortType;
    },
  >(params: IParam) {
    const pipelines: PipelineStage[] = [];
    pipelines.push({ $addFields: { id: { $toString: '$_id' } } });

    const keywordConds = {};
    if (params.keyword) {
      keywordConds['$or'] = [
        { id: { $regex: params.keyword, $options: 'i' } },
        { name: { $regex: params.keyword, $options: 'i' } },
        { nameKana: { $regex: params.keyword, $options: 'i' } },
      ];
    }

    const dateConds = {};
    if (params.from) dateConds['$and'] = [{ createdAt: { $gte: params.from } }];
    if (params.to) {
      const toDate = this.dateUtilService.getTzEndOfDay(params.to);
      dateConds['$and'] = dateConds['$and']
        ? dateConds['$and'].concat({ createdAt: { $lte: toDate } })
        : [{ createdAt: { $lte: toDate } }];
    }

    const statusCond = params.status ? { status: { $in: params.status } } : {};
    if (params.sort) pipelines.push({ $sort: params.sort });

    pipelines.push({
      $match: { ...dateConds, ...statusCond, ...keywordConds },
    });

    pipelines.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        docs: [
          // limit the data after query
          { $skip: params.skip },
          { $limit: params.limit },
          {
            $lookup: {
              from: 'manipulators',
              localField: 'owner',
              foreignField: '_id',
              as: 'owners',
            },
          },
          {
            $set: {
              owner: {
                $first: '$owners',
              },
            },
          },
        ],
      },
    });

    const data = await this.aggregate(pipelines).exec();
    return {
      docs: _get(data, '0.docs') || [],
      skip: params.skip,
      limit: params.limit,
      totalDocs: _get(data, '0.metadata.0.total') || 0,
    };
  }
}
