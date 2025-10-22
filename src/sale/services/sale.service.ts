import { SalonDocument } from '@src/salon/schemas/salon.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReservationDocument } from '@src/reservation/schemas/reservation.schema';
import { QueryOptions } from 'mongoose';
import { SaleRepository } from '../repositories/sale.repository';
import { SaleDocument } from '../schemas/sale.schema';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  SearchSaleInput,
  SearchSaleOutput,
  SearchSaleItem,
} from '@src/sale/dtos/search-sale.dto';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import { get as _get } from 'lodash';
import { ManipulatorRepository } from '@src/account/repositories/manipulator.repository';

@Injectable()
export class SaleService {
  constructor(
    private saleRepository: SaleRepository,
    private configService: ConfigService,
    private commonUtilsService: CommonUtilService,
    private manRepository: ManipulatorRepository,
  ) {}

  /**
   *
   * Creating sale record
   *
   * @param {ReservationDocument} reservation
   * @param {QueryOptions | undefined} options
   * @returns  Promise<SaleDocument>
   */
  async createSaleRecord(
    reservation: ReservationDocument,
    options?: QueryOptions | undefined,
  ): Promise<SaleDocument> {
    const commissionRate = this.configService.get<number>('saleCommissionRate');
    const saleAmount = reservation.result.amount;
    const commission = saleAmount * commissionRate;
    const grossProfit = saleAmount - commission;

    return this.saleRepository.create(
      {
        reservation: reservation._id,
        salon: reservation.salon._id,
        saleAmount: saleAmount,
        commission: commission,
        profit: grossProfit > 0 ? grossProfit : 0,
      },
      options,
    );
  }

  /**
   * Finding Sales from the operator side
   *
   * @param {SearchSaleInput} params
   * @param {PaginateDto} paginate
   * @returns {Promise<SearchSaleOutput>}
   */
  async findSales(
    params: SearchSaleInput,
    paginationParam: PaginateDto,
  ): Promise<SearchSaleOutput> {
    const sales = await this.saleRepository.search({
      fromDate: params.from,
      toDate: params.to,
      keyword: params.keyword,
      skip: (paginationParam.page - 1) * paginationParam.limit,
      limit: paginationParam.limit,
      sort: paginationParam.sort,
    });

    const manipulatorIds = sales.docs.map((sale) =>
      sale.reservationData.manipulator._id.toHexString(),
    );
    const manipulators = await this.manRepository.getManipulatorsHashByIds(
      manipulatorIds,
    );

    const { docs = [], ...pagination } = sales;
    const totalSaleAmount = sales.totalSaleAmount;
    const result = new SearchSaleOutput();

    const list = docs.map((item) => {
      const sale = item;
      const reservation = sale.reservationData as ReservationDocument;
      const salon = sale.salonData as SalonDocument;
      const data = new SearchSaleItem();
      const manId = reservation.manipulator._id.toHexString();

      data.transactionId =
        reservation.paymentInfo?.veritransTransactionId || '';
      data.transactionDate = data.transactionId
        ? _get(reservation, 'updatedAt').toISOString()
        : '';
      data.salonId = salon._id.toHexString();
      data.salonName = salon.nameKana ?? salon.name;
      data.manipulatorName = manipulators.get(manId)?.name;
      data.menuName = reservation.result.menuInfo.name;
      data.saleAmount = item.saleAmount;
      return data;
    });
    result.docs = list;
    const dataPaging = this.commonUtilsService.calcPaginateData(
      pagination.skip,
      pagination.limit,
      pagination.totalDocs,
    );
    return { ...result, ...dataPaging, totalSaleAmount };
  }
}
