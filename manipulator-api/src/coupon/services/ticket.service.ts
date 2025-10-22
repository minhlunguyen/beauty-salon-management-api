import { Injectable } from '@nestjs/common';
import { AppException } from '@src/common/exceptions/app.exception';
import { MenuRepository } from '@src/salon/repositories/menu.repository';
import { Types } from 'mongoose';
import { Errors } from '../contracts/error';
import {
  IssuedTicketStatus,
  IssueType,
  IGetTicketInput,
  CouponStatus,
  CouponType,
  IChangeMenuTicketResult,
  ICreateTicketInput,
  ICreateTicketOutput,
  IUpdateTicketInput,
} from '../contracts/interfaces';
import { C2cCouponService } from './c2c-coupon.service';
import { MenuType } from '@src/salon/contracts/type';
import { IssuedTicketRepository } from '../repositories/issued-ticket.repository';
import { PaymentService } from '@src/payment/services/payment.service';
import { CustomerDocument } from '@src/account/schemas/customer.schema';
import { CustomerBuyTicketDto } from '../dtos/customer-buy-ticket.dto';
import { TicketRepository } from '@src/salon/repositories/ticket.repository';
import { CustomerTicketPaymentRepository } from '../repositories/customer-ticket-payment.repository';
import { CustomerTicketPayment } from '../schemas/customer-ticket-payment.schema';
import { IssuedTicketDocument } from '../schemas/issued-ticket.schema';
import { AppLogger } from '@src/common/services/app-logger.service';
import { ManipulatorRepository } from '@src/account/repositories/manipulator.repository';
import { ConfigService } from '@nestjs/config';
import { MenuDocument } from '@src/salon/schemas/menu.schema';
import { MenuTicketDto } from '@src/salon/dtos/create-menu.dto';
import {
  GetCustomerTicketBySalonOutput,
  GetTicketForReservationOutput,
  CustomerTicketListOuput,
} from '../contracts/openapi';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import { DateUtilService } from '@src/common/services/date-utils.service';

@Injectable()
export class TicketService {
  constructor(
    private c2cCouponService: C2cCouponService,
    private menuRepository: MenuRepository,
    private issuedTicketRepository: IssuedTicketRepository,
    private ticketRepository: TicketRepository,
    private customerTicketPaymentRepository: CustomerTicketPaymentRepository,
    private paymentService: PaymentService,
    private loggerService: AppLogger,
    private commonUtilsService: CommonUtilService,
    private manipulatorRepository: ManipulatorRepository,
    private configService: ConfigService,
    private dateUtilsService: DateUtilService,
  ) {}

  /*  Create Ticket
   *
   * @param {ICreateTicketInput} input
   * @returns
   */
  async createTicket(input: ICreateTicketInput): Promise<ICreateTicketOutput> {
    const coupon = await this.c2cCouponService.createCoupon({
      title: input.ticketName,
      currency: '%',
      amount: 100,
      status: CouponStatus.ACTIVE,
      type: CouponType.PRIVATE,
      servicerId: input.servicerId,
      rules: {
        allowMenuIds: [input.menuId],
        availableDays: input.availableDays,
        issueCouponNumber: input.numberOfTicket,
        ableToIssueMultiple: true,
      },
    });

    return { id: coupon.id, code: coupon.code };
  }

  /**
   *  delete ticket
   *
   * @param {string} customerId
   * @returns
   */
  async deleteTicket(id: number): Promise<boolean> {
    return this.c2cCouponService.deleteCoupon(id);
  }

  /**
   *  Assign tag Ticket
   *
   * @param {string} customerId
   * @returns
   */
  async assignTicketTags(id: number): Promise<boolean> {
    // assign couponTicketTagId to coupon
    const ticketTagId = this.configService.get<number>('couponTicketTagId');
    await this.c2cCouponService.assignTags(id, [Number(ticketTagId)]);
    return true;
  }

  /**
   *  Active ticket
   *
   * @param {number} id
   * @returns
   */
  async inActiveTicket(id: number): Promise<boolean> {
    await this.c2cCouponService.changeCouponStatus(id, CouponStatus.INACTIVE);
    return true;
  }

  async customerBuyTickets(
    customer: CustomerDocument,
    ticketId: string,
    dto: CustomerBuyTicketDto,
  ): Promise<boolean> {
    const ticket = await this.ticketRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(ticketId),
      },
      error: Errors.TICKET_NOT_FOUND,
    });

    if (!ticket.price || !ticket.numberOfTicket) {
      const { code, status, message } = Errors.TICKET_IS_INVALID;
      throw new AppException(code, message, status);
    }

    const menu = await this.menuRepository.findOne({
      conditions: { _id: new Types.ObjectId(ticket.menuId) },
      selectedFields: ['_id', 'salonId', 'createdById', 'ticket', 'menuTypes'],
    });

    if (!menu || !menu.menuTypes.includes(MenuType.Coupon)) {
      const { code, message, status } = Errors.MENU_IS_INVALID;
      throw new AppException(code, message, status);
    }

    if (!menu.ticket) {
      const { code, message, status } = Errors.MENU_HAVE_NO_TICKET;
      throw new AppException(code, message, status);
    }

    if (!customer.veritransAccountId) {
      const { code, status, message } = Errors.INVALID_PAYMENT_ACCOUNT;
      throw new AppException(code, message, status);
    }

    const currentTime = this.dateUtilsService.getTzMoment(new Date()).toDate();
    const issuedTicket = await this.issuedTicketRepository.findOne({
      conditions: {
        customerId: new Types.ObjectId(customer._id),
        ticketId: new Types.ObjectId(ticket._id),
        status: IssuedTicketStatus.ACTIVE,
        expiredAt: { $gte: currentTime },
      },
    });

    if (issuedTicket) {
      const { code, status, message } = Errors.CUSTOMER_CAN_NOT_BUY_TICKET;
      throw new AppException(code, message, status);
    }

    /*
     * 1. Create/update .customerTicket
     * 2. Insert customerTicketPayment
     * 3. Payment ticket via Veritrans service
     * 4. Issue ticket to Coupon service
     * 5. Insert to issuedTicket
     */
    try {
      const session = await this.issuedTicketRepository.startSession();
      await session.withTransaction(async (session) => {
        const amount = ticket.numberOfTicket * ticket.price;
        const metaDataPayment = {
          ticketId: ticket._id.toString(),
          coupon: ticket.code,
          couponId: ticket.couponId + '',
        };

        // make payment ticket to veritrans
        const paymentResponse = await this.paymentService.makePaymentTicket(
          customer.veritransAccountId,
          dto.paymentMethod,
          amount,
          metaDataPayment,
        );

        // add data customer ticket payment
        const customerTicketPaymentData: CustomerTicketPayment = {
          amount: amount,
          customerId: customer._id,
          menuId: menu._id,
          salonId: menu.salonId,
          ticketId: ticket._id,
          paymentTransactionId: paymentResponse.veritransTransactionId,
        };

        const customerTicketPaymentEntity =
          await this.customerTicketPaymentRepository.create(
            customerTicketPaymentData,
            { session },
          );

        // issues ticket to coupon api
        const coupon = await this.c2cCouponService.issueCoupon({
          code: ticket.code,
          type: IssueType.COUPON,
          customerId: customer._id.toString(),
        });

        // insert issued tickets
        const issuedTickets = coupon.issuedCoupons.map((item) => {
          const issuedTicket = {
            customerId: customer._id,
            ticketId: ticket._id,
            couponIssuedId: item.id,
            menuId: menu._id,
            salonId: menu.salonId,
            expiredAt: item.expiredAt,
            customerTicketPaymentId: customerTicketPaymentEntity._id,
            status: item.status,
          } as any as IssuedTicketDocument;
          return issuedTicket;
        });

        await this.issuedTicketRepository.insertMany(issuedTickets, {
          session,
        });
      });
      session.endSession();

      return true;
    } catch (error: any) {
      // logging the occurred error for investigating.
      const { message: errorMsg, stack } = error;
      this.loggerService.error(
        errorMsg,
        stack,
        JSON.stringify({
          ...dto,
          loggedUser: customer._id.toHexString(),
        }),
      );
      if (error instanceof AppException) {
        throw error;
      } else {
        const { code, message, status } = Errors.CUSTOMER_BUY_TICKET_FAILED;
        throw new AppException(code, message, status);
      }
    }
  }

  /**
   * Get the customer tickets
   *
   * @param {string} customerId
   * @param {IGetTicketInput} params
   * @returns {Promise<CustomerTicketListOuput>}
   */
  async getCustomerTickets(
    customerId: string,
    params: IGetTicketInput,
  ): Promise<CustomerTicketListOuput> {
    const result = await this.issuedTicketRepository.getCustomerTickets(
      customerId,
      params,
    );

    const menuHashed = await this.menuRepository.getMenusWithManipulator(
      (result.docs as any)
        .map((ticket) => ticket.menuId?.toHexString())
        .filter((ele) => ele !== undefined) || [],
    );

    const manipulatorHashed =
      await this.manipulatorRepository.getManipulatorsHashByIds(
        Array.from(menuHashed.values())
          .map((ele) => ele.manipulatorId)
          .filter((ele) => ele !== undefined),
        ['_id', 'name', 'nameKana'],
      );

    const docs = (result.docs as any).map((data) => {
      const menuData = menuHashed.get(data.menuId?.toHexString());
      return {
        menuId: data.menuId?.toHexString(),
        ticketId: data.ticketId.toHexString(),
        ticketName: menuData?.name || '',
        salonId: data.salonId,
        status: data.status,
        expiredAt: data.expiredAt,
        salonNameKana: data.salonNameKana || '',
        salonName: data.salonName || '',
        availableCount: data.availableCount,
        manipulatorInfo: {
          manipulatorId: manipulatorHashed
            .get(menuData?.manipulatorId)
            ?._id.toHexString(),
          manipulatorName: manipulatorHashed.get(menuData?.manipulatorId)?.name,
          manipulatorNameKana: manipulatorHashed.get(menuData?.manipulatorId)
            ?.nameKana,
        },
      };
    });
    const dataPaging = this.commonUtilsService.calcPaginateData(
      result.skip,
      result.limit,
      result.totalDocs,
    );

    return { docs, ...dataPaging };
  }
  /* Update ticket by coupon id
   *
   * @param {IUpdateTicketInput} data
   * @returns
   */
  async updateTicket(
    couponId: number,
    data: IUpdateTicketInput,
  ): Promise<boolean> {
    await this.c2cCouponService.updateCoupon(couponId, {
      title: data.ticketName,
      type: CouponType.PRIVATE,
      servicerId: data.servicerId,
      rules: {
        allowMenuIds: [data.menuId],
        availableDays: data.availableDays,
        issueCouponNumber: data.numberOfTicket,
        ableToIssueMultiple: true,
      },
    });

    return true;
  }

  /*
   * Process change menu's ticket
   */
  async processChangeMenuTicket(params: {
    menu: MenuDocument;
    ticketParams: MenuTicketDto;
    ticketName: string;
  }): Promise<IChangeMenuTicketResult> {
    const { menu, ticketParams, ticketName } = params;

    // create new ticket
    if (!menu.ticket) {
      const expiryMonth = ticketParams?.expiryMonth || 1;
      const ticketResponse = await this.createTicket({
        ticketName: menu.name,
        menuId: menu.id,
        availableDays: expiryMonth * 30,
        servicerId: menu.createdById.toString(),
        numberOfTicket: ticketParams.numberOfTicket,
      });
      await this.assignTicketTags(ticketResponse.id);
      return {
        couponId: ticketResponse.id,
        isCreate: true,
        code: ticketResponse.code,
      };
    }

    // No update ticket
    if (
      menu.ticket &&
      menu.ticket.expiryMonth === ticketParams.expiryMonth &&
      menu.ticket.numberOfTicket === ticketParams.numberOfTicket
    ) {
      return { couponId: menu.ticket.couponId };
    }

    // Update ticket when manipulator want to change ticket data
    const expiryMonth = ticketParams.expiryMonth || 1;
    const ticketUpdate: IUpdateTicketInput = {
      menuId: menu.id,
      availableDays: expiryMonth * 30,
      numberOfTicket: ticketParams.numberOfTicket,
      servicerId: menu.createdById.toString(),
      ticketName: ticketName,
    };
    await this.updateTicket(menu.ticket.couponId, ticketUpdate);

    return {
      couponId: menu.ticket.couponId,
      isUpdate: true,
      oldCouponData: {
        menuId: menu._id.toString(),
        availableDays: menu.ticket.expiryMonth * 30,
        numberOfTicket: menu.ticket.numberOfTicket,
        servicerId: menu.createdById.toString(),
        ticketName: menu.name,
      } as IUpdateTicketInput,
    };
  }

  /**
   * Get ticket for reservations
   *
   * @param {string} customerId
   * @param {string} menuId
   * @param {string} manipulatorId
   * @returns
   */
  async getTicketForReservation(
    customerId: string,
    menuId: string,
    manipulatorId: string,
  ): Promise<GetTicketForReservationOutput> {
    const menu = await this.menuRepository.findOne({
      conditions: { _id: menuId },
      selectedFields: ['_id', 'salonId', 'ticket', 'menuTypes', 'name'],
    });
    if (!menu || !menu.menuTypes.includes(MenuType.Coupon)) {
      const { code, message, status } = Errors.MENU_IS_INVALID;
      throw new AppException(code, message, status);
    }
    if (!menu.ticket) {
      const { code, message, status } = Errors.MENU_HAVE_NO_TICKET;
      throw new AppException(code, message, status);
    }

    const manipulator = await this.manipulatorRepository.findOne({
      conditions: { _id: new Types.ObjectId(manipulatorId) },
    });
    const salon = manipulator.salon[0];
    if (
      !manipulator ||
      !salon ||
      salon.salonId.toHexString() !== menu.salonId.toHexString()
    ) {
      const { code, message, status } = Errors.DATA_IS_INVALID;
      throw new AppException(code, message, status);
    }

    const ticket = await this.issuedTicketRepository.getCustomerTicketByMenu(
      customerId,
      menuId,
    );
    const result = new GetTicketForReservationOutput();
    result.manipulatorName = manipulator.name;
    result.manipulatorNameKana = manipulator.nameKana;
    result.salonName = salon.name;
    result.salonNameKana = salon.nameKana;
    result.ticket = ticket
      ? {
          id: ticket.id,
          name: menu.name,
          availableCount: ticket.availableCount,
          expiredAt: ticket.expiredAt,
        }
      : null;

    return result;
  }

  /**
   * Get the customer tickets by Salon
   *
   * @param {string} salonId
   * @param {IGetTicketInput} params
   * @returns {Promise<GetCustomerTicketBySalonOutput>}
   */
  async getCustomerTicketBySalon(
    salonId: string,
    params: IGetTicketInput,
  ): Promise<GetCustomerTicketBySalonOutput> {
    const result = await this.issuedTicketRepository.getCustomerTicketsBySalon(
      salonId,
      params,
    );

    const customerIds = (result.docs as any).map((customer) =>
      customer._id.toString(),
    );
    const tickets = await this.issuedTicketRepository.getTicketsGroupByCustomer(
      salonId,
      customerIds,
    );

    const docs = (result.docs as any).map((data) => {
      return {
        id: data._id.toHexString(),
        customerName: data.customerName,
        customerNameKana: data.customerNameKana,
        tickets: tickets.has(data._id.toString())
          ? Array.from(tickets.get(data._id.toString()).values()).sort(
              (ele1, ele2) =>
                ele1.expiredAt.getTime() - ele2.expiredAt.getTime(),
            )
          : [],
      };
    });

    const dataPaging = this.commonUtilsService.calcPaginateData(
      result.skip,
      result.limit,
      result.totalDocs,
    );

    return { docs, ...dataPaging };
  }
}
