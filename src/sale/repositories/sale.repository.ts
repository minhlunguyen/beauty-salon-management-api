import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, PipelineStage } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sale, SaleDocument } from '@src/sale/schemas/sale.schema';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { get as _get } from 'lodash';
@Injectable()
export class SaleRepository extends AbstractRepository<SaleDocument> {
  constructor(
    @InjectModel(Sale.name) model: PaginateModel<SaleDocument>,
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
      fromDate?: Date;
      toDate?: Date;
    },
  >(params: SearchParam) {
    const pipelines: PipelineStage[] = [];
    let keywordConds: Record<any, any> = {};
    const timeRangeCondition: Record<any, any> = {};
    let conditions = {};

    pipelines.push({
      $lookup: {
        from: 'reservations',
        localField: 'reservation',
        foreignField: '_id',
        as: 'reservationData',
      },
    });

    pipelines.push({
      $lookup: {
        from: 'salons',
        localField: 'salon',
        foreignField: '_id',
        as: 'salonData',
      },
    });

    if (params.keyword) {
      keywordConds = {
        $or: [
          {
            'reservationData.paymentInfo.veritransTransactionId': {
              $regex: params.keyword,
              $options: 'i',
            },
          },
          {
            'salonData.name': {
              $regex: params.keyword,
              $options: 'i',
            },
          },
          {
            'salonData.nameKana': {
              $regex: params.keyword,
              $options: 'i',
            },
          },
        ],
      };
    }

    if (params.fromDate || params.toDate) {
      timeRangeCondition['$and'] = [{ saleAmount: { $gt: 0 } }];
    }

    if (params.fromDate) {
      timeRangeCondition['$and'].push({
        createdAt: { $gte: params.fromDate },
      });
    }

    if (params.toDate) {
      const toDate = this.dateUtilService.getTzEndOfDay(params.toDate);
      timeRangeCondition['$and'].push({
        createdAt: { $lte: toDate },
      });
    }

    conditions = { ...keywordConds, ...timeRangeCondition, ...conditions };

    pipelines.push({ $match: conditions });

    if (params.sort) {
      pipelines.push({ $sort: params.sort });
    }

    pipelines.push({
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalAmount: { $sum: '$saleAmount' },
            },
          },
        ],
        docs: [
          // limit the data after query
          { $skip: params.skip },
          { $limit: params.limit },
          {
            $set: {
              reservationData: {
                $first: '$reservationData',
              },
              salonData: {
                $first: '$salonData',
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
      totalSaleAmount: _get(data, '0.metadata.0.totalAmount') || 0,
    };
  }
}
