import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, PipelineStage } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { DateUtilService } from '@src/common/services/date-utils.service';
import * as _ from 'lodash';

@Injectable()
export class CustomerRepository extends AbstractRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name) model: PaginateModel<CustomerDocument>,
    private readonly dateUtilService: DateUtilService,
  ) {
    super(model);
  }

  async search<
    SearchParam extends {
      limit?: number;
      skip?: number;
      sort?: any;
      keyword?: string;
      status?: string[];
      fromRegisterDate?: Date;
      toRegisterDate?: Date;
    },
  >(params: SearchParam) {
    const pipelines: PipelineStage[] = [];
    let keywordCond: Record<any, any> = {};
    const timeRangeCondition: Record<any, any> = {};
    let conditions = {};

    pipelines.push({
      $addFields: {
        id: { $toString: '$_id' },
      },
    });

    if (params.keyword) {
      keywordCond = {
        $or: [
          { name: { $regex: params.keyword, $options: 'i' } },
          {
            nameKana: { $regex: params.keyword, $options: 'i' },
          },
          {
            id: { $regex: params.keyword, $options: 'i' },
          },
        ],
      };
    }

    if (params.fromRegisterDate || params.toRegisterDate) {
      timeRangeCondition['$and'] = [];
    }

    if (params.fromRegisterDate) {
      timeRangeCondition['$and'].push({
        createdAt: { $gte: params.fromRegisterDate },
      });
    }

    if (params.toRegisterDate) {
      const toDate = this.dateUtilService.getTzEndOfDay(params.toRegisterDate);
      timeRangeCondition['$and'].push({
        createdAt: { $lte: toDate },
      });
    }

    if (params.status) {
      conditions = { ...conditions, status: { $in: params.status } };
    }

    conditions = { ...keywordCond, ...timeRangeCondition, ...conditions };

    pipelines.push({ $match: conditions });

    if (params.sort) {
      pipelines.push({ $sort: params.sort });
    }

    pipelines.push({
      $facet: {
        metadata: [
          {
            $count: 'total',
          },
        ],
        docs: [
          // limit the data after query
          { $skip: params.skip },
          { $limit: params.limit },
        ],
      },
    });

    const data = await this.aggregate(pipelines).exec();
    return {
      docs: _.get(data, '0.docs') || [],
      skip: params.skip,
      limit: params.limit,
      totalDocs: _.get(data, '0.metadata.0.total') || 0,
    };
  }
}
