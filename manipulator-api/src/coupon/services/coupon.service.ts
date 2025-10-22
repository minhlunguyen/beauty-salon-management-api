import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { AppException } from '@src/common/exceptions/app.exception';
import { MenuRepository } from '@src/salon/repositories/menu.repository';
import { SalonRepository } from '@src/salon/repositories/salon.repository';
import { MenuDocument } from '@src/salon/schemas/menu.schema';
import { SalonDocument } from '@src/salon/schemas/salon.schema';
import { Types } from 'mongoose';
import { Errors } from '../contracts/error';
import {
  CouponItemOutput,
  CouponRuleOutput,
  GetCouponForReservationOutput,
  GetCustomerCouponOutput,
} from '../contracts/openapi';
import {
  CouponStatus,
  CouponType,
  ICompleteCouponInput,
  IUseCouponOutput,
  TransactionStatus,
} from '../contracts/interfaces';
import { C2cCouponService } from './c2c-coupon.service';
import { IUseCouponInput } from '../contracts/interfaces';

@Injectable()
export class CouponService {
  constructor(
    private c2cCouponService: C2cCouponService,
    private configService: ConfigService,
    private menuRepository: MenuRepository,
    private salonRepository: SalonRepository,
  ) {}

  /**
   * Get customer's available coupons
   * @param {string} customerId
   * @param {PaginateDto} paginateData
   * @returns
   */
  async getCustomerAvailableCoupons(
    customerId: string,
    paginateData: PaginateDto,
    { type },
  ): Promise<GetCustomerCouponOutput> {
    const ticketTag = this.configService.get<string>('couponTicketTag');

    const result = new GetCustomerCouponOutput();
    if (type === CouponType.PRIVATE) {
      const couponReturn =
        await this.c2cCouponService.getIssuedAvailableCoupons({
          withoutTag: ticketTag,
          customerId: customerId,
          limit: paginateData.limit,
          page: paginateData.page,
          sort: 'createdAt',
          order: 'desc',
        });

      let menuIds: string[] = [];
      couponReturn.items?.forEach((coupon) => {
        menuIds = coupon.rules.allowMenuIds
          ? menuIds.concat(coupon.rules?.allowMenuIds)
          : menuIds;
      });
      let menuInfoList = new Map<string, MenuDocument>();
      if (menuIds.length) {
        menuInfoList = await this.menuRepository.getMenusHashByIds(menuIds);
      }

      result.total = couponReturn.total;
      result.page = couponReturn.page;
      result.perPage = couponReturn.perPage;
      result.lastPage = couponReturn.lastPage;
      result.items = couponReturn.items.map((coupon) => {
        const allowMenuIds = coupon.rules?.allowMenuIds || [];
        return {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          currency: coupon.currency,
          amount: coupon.amount,
          menus: allowMenuIds
            .map((menuId) => {
              if (!menuInfoList.has(menuId)) return undefined;
              return {
                id: menuInfoList.get(menuId)._id.toHexString(),
                name: menuInfoList.get(menuId).name,
              };
            })
            .filter((menu) => menu !== undefined),
          description: coupon.description,
          rules: {
            min: coupon.rules?.min,
            allowMenuIds: coupon.rules?.allowMenuIds,
          } as CouponRuleOutput,
          expiredAt: coupon.expiredAt,
        } as CouponItemOutput;
      });
    } else {
      const couponReturn = await this.c2cCouponService.getCoupons({
        withoutTag: ticketTag,
        type: CouponType.PUBLIC,
        customerId: customerId,
        limit: paginateData.limit,
        page: paginateData.page,
        sort: 'end',
        order: 'asc',
        status: CouponStatus.ACTIVE,
      });

      let menuIds: string[] = [];
      couponReturn.items?.forEach((coupon) => {
        menuIds = coupon.rules.allowMenuIds
          ? menuIds.concat(coupon.rules?.allowMenuIds)
          : menuIds;
      });
      let menuInfoList = new Map<string, MenuDocument>();
      if (menuIds.length) {
        menuInfoList = await this.menuRepository.getMenusHashByIds(menuIds);
      }

      result.total = couponReturn.total;
      result.page = couponReturn.page;
      result.perPage = couponReturn.perPage;
      result.lastPage = couponReturn.lastPage;
      result.items = couponReturn.items.map((coupon) => {
        return {
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          currency: coupon.currency,
          amount: coupon.amount,
          menus: coupon.rules?.allowMenuIds
            ? coupon.rules.allowMenuIds
                .map((menuId) => {
                  if (!menuInfoList.has(menuId)) return undefined;
                  return {
                    id: menuInfoList.get(menuId)._id.toHexString(),
                    name: menuInfoList.get(menuId).name,
                  };
                })
                .filter((menu) => menu !== undefined)
            : [],
          description: coupon.description,
          rules: {
            min: coupon.rules?.min,
            allowMenuIds: coupon.rules?.allowMenuIds,
          } as CouponRuleOutput,
          expiredAt: coupon.rules?.end,
        } as CouponItemOutput;
      });
    }

    return result;
  }

  /**
   * Get coupons for reservations
   *
   * @param {string} customerId
   * @param {string} menuId
   * @param {string} salonId
   * @returns
   */
  async getCouponsForReservation(
    customerId: string,
    menuId: string,
    salonId: string,
  ): Promise<GetCouponForReservationOutput> {
    const menu = await this.menuRepository.getMenusHashByIds(
      [menuId],
      ['_id', 'salonId'],
    );
    if (!menu.has(menuId)) {
      const { code, message, status } = Errors.MENU_IS_INVALID;
      throw new AppException(code, message, status);
    }

    const salon = await this.salonRepository.findOne({
      conditions: { _id: new Types.ObjectId(salonId) },
    });
    if (
      !salon ||
      salon._id.toHexString() !== menu.get(menuId).salonId.toHexString()
    ) {
      const { code, message, status } = Errors.MENU_IS_INVALID;
      throw new AppException(code, message, status);
    }

    const privateCoupons = this._getPrivateCouponsForReservation(
      customerId,
      menuId,
      salon,
    );
    const publicCoupons = this._getPublicCouponsForReservation(
      customerId,
      menuId,
      salon,
    );
    const coupons = await Promise.all([privateCoupons, publicCoupons]);

    const result = new GetCouponForReservationOutput();
    result.items = result.items
      .concat(coupons[0])
      .concat(coupons[1])
      .sort((ele1, ele2) => {
        if (!ele1.expiredAt) return 1;
        if (!ele2.expiredAt) return -1;
        return (
          new Date(ele1.expiredAt).getTime() -
          new Date(ele2.expiredAt).getTime()
        );
      });

    return result;
  }

  /**
   * Get customer private coupons for booking
   *
   * @param {string} customerId
   * @param {string} menuId
   * @param {SalonDocument} salon
   * @returns {Promise<CouponItemOutput[]>}
   */
  async _getPrivateCouponsForReservation(
    customerId: string,
    menuId: string,
    salon: SalonDocument,
  ): Promise<CouponItemOutput[]> {
    const ticketTag = this.configService.get<string>('couponTicketTag');
    const privateCoupon = await this.c2cCouponService.getIssuedAvailableCoupons(
      {
        withoutTag: ticketTag,
        customerId: customerId,
        limit: 1000,
        page: 1,
      },
    );

    const result: CouponItemOutput[] = [];
    if (privateCoupon.items.length) {
      for (const coupon of privateCoupon.items) {
        if (
          coupon.rules.allowMenuIds &&
          coupon.rules.allowMenuIds.length > 0 &&
          !coupon.rules.allowMenuIds.includes(menuId)
        ) {
          continue;
        }

        if (
          coupon.servicerId &&
          coupon.servicerId !== salon.owner._id.toHexString()
        ) {
          continue;
        }

        result.push({
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          currency: coupon.currency,
          amount: coupon.amount,
          rules: {
            min: coupon.rules?.min,
            allowMenuIds: coupon.rules?.allowMenuIds,
          } as CouponRuleOutput,
          description: coupon.description,
          expiredAt: coupon.expiredAt,
          quantumIssueUsage: coupon.quantumIssueUsage,
        } as CouponItemOutput);
      }
    }

    return result;
  }

  /**
   * Get customer public coupons for booking
   *
   * @param {string} customerId
   * @param {string} menuId
   * @param {SalonDocument} salon
   * @returns {Promise<CouponItemOutput[]>}
   */
  async _getPublicCouponsForReservation(
    customerId: string,
    menuId: string,
    salon: SalonDocument,
  ): Promise<CouponItemOutput[]> {
    const ticketTag = this.configService.get<string>('couponTicketTag');
    const couponReturn = await this.c2cCouponService.getCoupons({
      withoutTag: ticketTag,
      type: CouponType.PUBLIC,
      customerId: customerId,
      limit: 1000,
      page: 1,
      status: CouponStatus.ACTIVE,
    });

    const result: CouponItemOutput[] = [];
    if (couponReturn.items.length) {
      for (const coupon of couponReturn.items) {
        if (
          coupon.rules.allowMenuIds &&
          coupon.rules.allowMenuIds.length > 0 &&
          !coupon.rules.allowMenuIds.includes(menuId)
        ) {
          continue;
        }

        if (
          coupon.servicerId &&
          coupon.servicerId !== salon.owner._id.toHexString()
        ) {
          continue;
        }

        result.push({
          id: coupon.id,
          code: coupon.code,
          title: coupon.title,
          currency: coupon.currency,
          amount: coupon.amount,
          rules: {
            min: coupon.rules?.min,
            allowMenuIds: coupon.rules?.allowMenuIds,
          } as CouponRuleOutput,
          description: coupon.description,
          expiredAt: coupon.rules?.end,
        } as CouponItemOutput);
      }
    }

    return result;
  }

  /**
   * Using the coupon
   *
   * @param {string} couponCode The coupon code
   * @param {IUseCouponInput} input
   * @returns {Promise<IUseCouponOutput>}
   */
  async useCoupon(
    couponCode: string,
    input: IUseCouponInput,
  ): Promise<IUseCouponOutput> {
    return this.c2cCouponService.useCoupon(couponCode, input);
  }

  /**
   * Complete transaction using the coupon
   *
   * @param {number} transactionId The coupon transaction
   * @param {ICompleteCouponInput} input The transaction input data
   * @returns {Promise<IUseCouponOutput>}
   */
  async completeTransaction(
    transactionId: number,
    input: ICompleteCouponInput,
  ): Promise<boolean> {
    try {
      return await this.c2cCouponService.completeTransaction(transactionId);
    } catch (error) {
      const { appTransactionId, code, customerId } = input;
      const trans = await this.c2cCouponService.getTransactionByCode(
        appTransactionId,
        customerId,
        code,
      );

      if (trans && trans.status === TransactionStatus.COMPLETED) {
        return true;
      }

      throw error;
    }
  }

  /**
   * Cancel the transaction
   *
   * @param {number} transactionId The coupon transaction
   * @returns {Promise<boolean>}
   */
  async cancelTransaction(transactionId: number): Promise<boolean> {
    return await this.c2cCouponService.cancelTransaction(transactionId);
  }
}
