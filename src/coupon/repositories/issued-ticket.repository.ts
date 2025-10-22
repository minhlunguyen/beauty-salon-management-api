import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, Types, PipelineStage } from 'mongoose';
import {
  IssuedTicketDocument,
  IssuedTicket,
} from '../schemas/issued-ticket.schema';
import {
  ICustomerTicket,
  IGetTicketInput,
  IssuedTicketStatus,
} from '../contracts/interfaces';
import { get as _get } from 'lodash';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { TicketItemOuput } from '../contracts/openapi';

@Injectable()
export class IssuedTicketRepository extends AbstractRepository<IssuedTicketDocument> {
  constructor(
    @InjectModel(IssuedTicket.name)
    model: PaginateModel<IssuedTicketDocument>,
    private dateUtilService: DateUtilService,
  ) {
    super(model);
  }

  /**
   * Get the customer tickets by Salon
   *
   * @param {string} salonId
   * @param {IGetTicketInput} params
   * @returns
   */
  async getCustomerTicketsBySalon(
    salonId: string,
    params: IGetTicketInput,
  ): Promise<any> {
    // filtering by salon first to scope the data of salon
    const currentDate = this.dateUtilService.getTzMoment(new Date()).toDate();
    const pipelines: PipelineStage[] = [
      {
        $match: {
          salonId: new Types.ObjectId(salonId),
          status: IssuedTicketStatus.ACTIVE,
          expiredAt: { $gte: currentDate },
        },
      },
    ];

    // populating the customer data
    pipelines.push({
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customers',
      },
    });
    pipelines.push({ $set: { customer: { $first: '$customers' } } });

    if (params.keyword) {
      // filtering the name if it's be passed.
      pipelines.push({
        $match: {
          $or: [
            { 'customer.name': { $regex: params.keyword, $options: 'i' } },
            { 'customer.nameKana': { $regex: params.keyword, $options: 'i' } },
          ],
        },
      });
    }

    // group and filter the customers who still have the available tickets
    pipelines.push({
      $group: {
        _id: '$customerId',
        totalCount: { $sum: 1 },
        customerNameKana: { $first: '$customer.nameKana' },
        customerName: { $first: '$customer.name' },
      },
    });
    pipelines.push({ $match: { totalCount: { $gt: 0 } } });
    pipelines.push({ $sort: { _id: 1 } });
    pipelines.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        docs: [{ $skip: params.skip }, { $limit: params.limit }],
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

  /**
   * Get tickets group by customer
   *
   * @param {string} salonId
   * @param {string[]} customerIds
   * @returns {Promise<Map<string, Map<string, ICustomerTicket>>>}
   */
  async getTicketsGroupByCustomer(
    salonId: string,
    customerIds: string[],
  ): Promise<Map<string, Map<string, ICustomerTicket>>> {
    const result = new Map<string, Map<string, ICustomerTicket>>();

    const currentDate = this.dateUtilService.getTzMoment(new Date()).toDate();
    const issuedTickets = await this.find({
      conditions: {
        salonId: new Types.ObjectId(salonId),
        customerId: { $in: customerIds.map((id) => new Types.ObjectId(id)) },
        expiredAt: { $gte: currentDate },
        status: IssuedTicketStatus.ACTIVE,
      },
      populates: [{ path: 'menuId', select: 'name' }],
    });

    for (const ticket of issuedTickets) {
      const ticketId = ticket.ticketId.toHexString();
      const customerId = ticket.customerId.toHexString();
      if (!result.has(customerId))
        result.set(customerId, new Map<string, ICustomerTicket>());

      if (!result.get(customerId).has(ticketId)) {
        result.get(customerId).set(ticketId, {
          ticketId: ticketId,
          name: (ticket.menuId as any)?.name,
          expiredAt: ticket.expiredAt,
          availableCount: 1,
        } as ICustomerTicket);
      } else {
        const curTicket = result.get(customerId).get(ticketId);
        curTicket.availableCount = curTicket.availableCount + 1;
        curTicket.expiredAt =
          curTicket.expiredAt.getTime() > ticket.expiredAt.getTime()
            ? ticket.expiredAt
            : curTicket.expiredAt;
        result.get(customerId).set(ticketId, curTicket);
      }
    }

    return result;
  }

  /**
   * Get ticket for reservation
   *
   * @param {string} customerId
   * @param {string} menuId
   * @returns Promise<TicketItemOuput>
   */
  async getCustomerTicketByMenu(
    customerId: string,
    menuId: string,
  ): Promise<TicketItemOuput> {
    const currentDate = this.dateUtilService.getTzMoment(new Date()).toDate();
    const data = await this.aggregate([
      {
        $match: {
          customerId: new Types.ObjectId(customerId),
          menuId: new Types.ObjectId(menuId),
          status: IssuedTicketStatus.ACTIVE,
          expiredAt: { $gte: currentDate },
        },
      },
      {
        $group: {
          _id: { customerId: '$customerId', ticketId: '$ticketId' },
          availableCount: { $sum: 1 },
          ticketId: { $first: '$ticketId' },
          menuId: { $first: '$menuId' },
          expiredAt: { $min: '$expiredAt' },
        },
      },
    ]).exec();

    const ticket = _get(data, 0);
    if (!ticket) {
      return null;
    }

    return {
      id: (ticket as any).ticketId,
      availableCount: (ticket as any).availableCount,
      expiredAt: (ticket as any).expiredAt,
    } as TicketItemOuput;
  }

  /**
   * Get customer tickets
   *
   * @param {string} customerId
   * @param {IGetTicketInput} params
   * @returns
   */
  async getCustomerTickets(
    customerId: string,
    params: IGetTicketInput,
  ): Promise<any> {
    // filtering by salon first to scope the data of salon
    const currentDate = this.dateUtilService.getTzMoment(new Date()).toDate();
    const pipelines: PipelineStage[] = [
      {
        $match: {
          customerId: new Types.ObjectId(customerId),
          status: IssuedTicketStatus.ACTIVE,
          expiredAt: { $gte: currentDate },
        },
      },
    ];
    pipelines.push({
      $lookup: {
        from: 'salons',
        localField: 'salonId',
        foreignField: '_id',
        as: 'salons',
      },
    });
    pipelines.push({ $set: { salon: { $first: '$salons' } } });
    // group and filter the customers who still have the available tickets
    pipelines.push({
      $group: {
        _id: { customerId: '$customerId', ticketId: '$ticketId' },
        availableCount: { $sum: 1 },
        ticketId: { $first: '$ticketId' },
        salonId: { $first: '$salonId' },
        menuId: { $first: '$menuId' },
        status: { $first: '$status' },
        expiredAt: { $min: '$expiredAt' },
        salonNameKana: { $first: '$salon.nameKana' },
        salonName: { $first: '$salon.name' },
      },
    });

    pipelines.push({ $sort: { expiredAt: 1 } });
    pipelines.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        docs: [{ $skip: params.skip }, { $limit: params.limit }],
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
