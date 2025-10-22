import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, PipelineStage, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Reservation,
  ReservationDocument,
} from '@src/reservation/schemas/reservation.schema';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { ReservationStatus } from '../contracts/types';
import * as _ from 'lodash';

@Injectable()
export class ReservationRepository extends AbstractRepository<ReservationDocument> {
  constructor(
    @InjectModel(Reservation.name) model: PaginateModel<ReservationDocument>,
    private dateUtilService: DateUtilService,
  ) {
    super(model);
  }

  /**
   * Get the schedules for specified date that will be dived by the manipulator.
   *
   * @param {string[]} manipulatorIds
   * @param {Date} date
   * @returns
   */
  public async getReservationsInDate(manipulatorIds: string[], date: Date) {
    // Fetching the resevertions in date that will be dived by the manipulator ID
    const reservedData = await this.find({
      conditions: {
        startTime: { $gte: this.dateUtilService.getTzStartOfDay(date) },
        endTime: { $lte: this.dateUtilService.getTzEndOfDay(date) },
        status: ReservationStatus.RESERVED,
        manipulator: {
          $in: manipulatorIds.map((id) => new Types.ObjectId(id)),
        },
      },
      selectedFields: ['_id', 'manipulator', 'startTime', 'endTime'],
    });

    // Loop and cook the reservation data
    const result = [];
    for (const data of reservedData) {
      const manId = (data.manipulator as Types.ObjectId).toHexString();
      if (!result[manId]) {
        result[manId] = [];
      }

      result[manId].push({
        id: data._id.toHexString(),
        startTime: data.startTime,
        endTime: data.endTime,
        slots: this.dateUtilService.getTimeSlotsInRange(
          data.startTime,
          data.endTime,
        ),
      });
    }

    return result;
  }

  /**
   * Get the schedules for specified date that will be dived by the salon.
   *
   * @param {string[]} salonIds
   * @param {Date} date
   * @returns
   */
  public async getSalonReservationsInDate(
    salonIds: string[],
    date: Date,
  ): Promise<Map<string, any[]>> {
    // Fetching the resevertions in date that will be dived by the manipulator ID
    const reservedData = await this.find({
      conditions: {
        startTime: { $gte: this.dateUtilService.getTzStartOfDay(date) },
        endTime: { $lte: this.dateUtilService.getTzEndOfDay(date) },
        status: ReservationStatus.RESERVED,
        salon: {
          $in: salonIds.map((id) => new Types.ObjectId(id)),
        },
      },
      selectedFields: ['_id', 'salon', 'startTime', 'endTime'],
    });

    // Loop and cook the reservation data
    const result = new Map<string, any[]>();
    for (const data of reservedData) {
      const sId = (data.salon as Types.ObjectId).toHexString();
      if (!result.has(sId)) result.set(sId, []);

      const reservationData = result.get(sId);
      reservationData.push({
        id: data._id.toHexString(),
        startTime: data.startTime,
        endTime: data.endTime,
        slots: this.dateUtilService.getTimeSlotsInRange(
          data.startTime,
          data.endTime,
        ),
      });
      result.set(sId, reservationData);
    }

    return result;
  }

  async search<
    SearchParam extends {
      limit?: number;
      skip?: number;
      sort?: any;
      keyword?: string;
      status?: string[];
      fromReservationDate?: Date;
      toReservationDate?: Date;
    },
  >(params: SearchParam) {
    const pipelines: PipelineStage[] = [];
    let keywordConds: Record<any, any> = {};
    const timeRangeCondition: Record<any, any> = {};
    let conditions = {};

    pipelines.push({
      $addFields: {
        id: { $toString: '$_id' },
      },
    });

    pipelines.push({
      $lookup: {
        from: 'manipulators',
        localField: 'manipulator',
        foreignField: '_id',
        as: 'manipulatorData',
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
          { 'customerInfo.name': { $regex: params.keyword, $options: 'i' } },
          {
            'customerInfo.nameKana': { $regex: params.keyword, $options: 'i' },
          },
          {
            id: { $regex: params.keyword, $options: 'i' },
          },
          {
            'manipulatorData.name': {
              $regex: params.keyword,
              $options: 'i',
            },
          },
          {
            'manipulatorData.nameKana': {
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

    if (params.fromReservationDate || params.toReservationDate) {
      timeRangeCondition['$and'] = [];
    }

    if (params.fromReservationDate) {
      timeRangeCondition['$and'].push({
        startTime: { $gte: params.fromReservationDate },
      });
    }

    if (params.toReservationDate) {
      const toDate = this.dateUtilService.getTzEndOfDay(
        params.toReservationDate,
      );
      timeRangeCondition['$and'].push({
        startTime: { $lte: toDate },
      });
    }

    if (params.status) {
      conditions = { ...conditions, status: { $in: params.status } };
    }

    conditions = { ...keywordConds, ...timeRangeCondition, ...conditions };

    pipelines.push({ $match: conditions });

    if (params.sort) {
      if (params.sort.reservationDate) {
        const { reservationDate, ...sort } = params.sort;
        params.sort = { startTime: reservationDate, ...sort };
      }
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
          {
            $set: {
              manipulatorData: {
                $first: '$manipulatorData',
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
      docs: _.get(data, '0.docs') || [],
      skip: params.skip,
      limit: params.limit,
      totalDocs: _.get(data, '0.metadata.0.total') || 0,
    };
  }

  /**
   * Checking the payment method is reserved.
   *
   * @param {string} paymentMethod
   * @returns {Promise<boolean>}
   */
  async isPaymentMethodInReserved(paymentMethod: string): Promise<boolean> {
    const entity = await this.findOne({
      conditions: {
        status: ReservationStatus.RESERVED,
        'paymentInfo.paymentMethod': paymentMethod,
      },
    });
    return !!entity;
  }
}
