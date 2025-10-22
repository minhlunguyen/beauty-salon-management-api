import { Injectable } from '@nestjs/common';
import { ManipulatorRepository } from '@src/account/repositories/manipulator.repository';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { QueryOptions, Types } from 'mongoose';
import {
  AvailableBookingSlotsOutput,
  CreateReservationOutput,
  GetReservationItemByCustomerOutput,
  ManipulatorInfoOutput,
  SalonInfoOutput,
  OperatorManipulatorInfoOutput,
  OperatorSalonInfoOutput,
  ValidatedReservationData,
} from '../contracts/types';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ReservationStatus } from '../contracts/types';
import {
  ManipulatorDocument,
  statuses,
} from '@src/account/schemas/manipulator.schema';
import { Errors } from '@src/account/contracts/error';
import { Errors as ReservationErrors } from '@src/reservation/contracts/error';
import { Errors as CommonErrors } from '@src/common/contracts/error';
import { MenuStatus, SalonStatus } from '@src/salon/contracts/type';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { PaymentService } from '@src/payment/services/payment.service';
import { CustomerDocument } from '@src/account/schemas/customer.schema';
import { AppException } from '@src/common/exceptions/app.exception';
import {
  PaymentInfo,
  ReservationInfo,
  ReservationCustomerInfo,
  CouponInfo,
  TicketInfo,
} from '../contracts/value-object';
import { PaymentMethodTypes } from '@src/payment/contracts/type';
import { ReservationDocument } from '../schemas/reservation.schema';
import { AppLogger } from '@src/common/services/app-logger.service';
import { differenceBy as _differenceBy } from 'lodash';
import { MailerService } from '@src/notification/services/mailer.service';
import { ConfigService } from '@nestjs/config';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  GetReservationsByCustomerOutput,
  OperatorPaymentInfo,
} from '../contracts/openapi';
import { SalonDocument } from '@src/salon/schemas/salon.schema';
import { ReservationDetail } from '@src/reservation/dtos/get-reservation-detail.dto';
import { CompleteReservationDto } from '../dtos/complete-reservation.dto';
import { S3Service } from '@src/media/services/s3.service';
import { OperatorReservationDetail } from '@src/reservation/dtos/operator-reservation-detail.dto';
import {
  ReservationList,
  ReservationItem,
  OperatorFindReservationItem,
  OperatorFindReservationsOutput,
  OperatorGetReservationListInput,
} from '@src/reservation/dtos/get-reservation-list.dto';
import { CustomerRepository } from '@src/account/repositories/customer.repository';
import { TreatmentHistoryService } from '@src/medical/services/treatment-history.service';
import { TreatmentFile } from '@src/medical/contracts/value-object';
import { FileRepository } from '@src/media/repositories/file.repository';
import { CreateNextReservationDto } from '../dtos/create-next-reservation.dto';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import { PaymentMethodStatuses } from '@src/payment/contracts/type';
import { ReservationHistoryService } from './reservation-history.service';
import { DailyScheduleService } from '@src/schedule/services/daily-schedule.service';
import { SaleService } from '@src/sale/services/sale.service';
import * as moment from 'moment-timezone';
import { CouponService } from '@src/coupon/services/coupon.service';
import { SalonRepository } from '@src/salon/repositories/salon.repository';
import { TicketService } from '@src/coupon/services/ticket.service';
import { TicketRepository } from '@src/salon/repositories/ticket.repository';
import { IssuedTicketRepository } from '@src/coupon/repositories/issued-ticket.repository';
import { IssuedTicketStatus } from '@src/coupon/contracts/interfaces';

@Injectable()
export class ReservationService {
  constructor(
    private manipulatorRepository: ManipulatorRepository,
    private dateUtilService: DateUtilService,
    private reservationRepository: ReservationRepository,
    private loggerService: AppLogger,
    private paymentService: PaymentService,
    private mailService: MailerService,
    private configService: ConfigService,
    private s3Service: S3Service,
    private customerRepository: CustomerRepository,
    private treatmentService: TreatmentHistoryService,
    private fileRepository: FileRepository,
    private commonUtilsService: CommonUtilService,
    private historyService: ReservationHistoryService,
    private dailyScheduleService: DailyScheduleService,
    private saleService: SaleService,
    private couponService: CouponService,
    private salonRepository: SalonRepository,
    private ticketService: TicketService,
    private ticketRepository: TicketRepository,
    private issuedTicketRepository: IssuedTicketRepository,
  ) {}

  /**
   * get available slots of manipulator for booking
   *
   * @param {string} manipulatorId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<AvailableBookingSlotsOutput>}
   */
  public async getAvailableBookingSlots(
    manipulatorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AvailableBookingSlotsOutput> {
    const manipulator = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(manipulatorId),
        status: statuses.ACTIVE,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    const availableSlots = await this.getAvailableTimeSlotsOfManipulators(
      [manipulatorId],
      startDate,
      endDate,
    );
    const result: AvailableBookingSlotsOutput = {
      availableSlots: availableSlots.get(manipulatorId) ?? [],
      manipulator: {
        name: manipulator.name,
        nameKana: manipulator.nameKana,
        salon: manipulator.salon.map((obj) => ({
          name: obj.name,
          nameKana: obj.nameKana,
          access: obj.access,
          photo: obj.photos,
        })),
        pr: manipulator.pr,
        photos: manipulator.photos,
        reviewRating: manipulator.reviewRating,
        menus: manipulator.menus.filter(
          (obj) => obj.status !== MenuStatus.Private,
        ),
      },
    };

    return result;
  }

  /**
   * Creating a new reservation
   *
   * @param {CustomerDocument} customer
   * @param {CreateReservationDto} dto
   * @param {number} finalAmount
   * @returns {Promise<CreateReservationOutput>}
   */
  public async createNewReservation(
    customer: CustomerDocument,
    dto: CreateReservationDto,
    finalAmount?: number,
  ): Promise<CreateReservationOutput> {
    // validate the submited data
    const validData = await this._validateReservationData(customer, dto);
    const { manipulator, menu, paymentMethod, couponUse, salon, ticketUse } =
      validData;

    if (ticketUse) {
      return await this.createNewReservationWithTicket(
        customer,
        dto,
        validData,
      );
    }

    try {
      const session = await this.reservationRepository.startSession();
      let reservation: ReservationDocument;
      await session.withTransaction(async (session) => {
        const discountAmount = couponUse ? couponUse.amount : 0;
        const amount = finalAmount ?? menu.price - discountAmount;

        const reservationInfo: ReservationInfo = {
          menuId: new Types.ObjectId(dto.menuId),
          menuInfo: menu,
          amount: amount > 0 ? amount : 0,
          totalAmount: menu.price,
          discountAmount: discountAmount,
        };

        const reservationCustomerInfo: ReservationCustomerInfo = {
          name: customer.name,
          nameKana: customer.nameKana,
          phone: customer.phone,
          email: customer.email,
        };

        // Create new reservation
        reservation = await this.reservationRepository.create(
          {
            customerId: customer._id,
            customerInfo: reservationCustomerInfo,
            manipulator: new Types.ObjectId(dto.manipulatorId),
            salon: salon._id,
            startTime: dto.startTime,
            endTime: dto.endTime,
            cancelDeadline: this.dateUtilService.getTzStartOfDay(dto.startTime),
            plan: reservationInfo,
            result: reservationInfo,
            status: ReservationStatus.RESERVED,
          },
          { session },
        );

        // Create the history record
        await this.historyService.createNewHistoryRecord(
          {
            reservation: reservation._id as Types.ObjectId,
            data: reservationInfo,
            status: ReservationStatus.RESERVED,
          },
          { session },
        );

        let paymentInfo: PaymentInfo = {
          paymentMethod: dto.paymentMethod,
          cardNumber: paymentMethod.details?.lastNumber,
          paymentMethodType: PaymentMethodTypes.CARD,
          status: PaymentMethodStatuses.DRAFT,
          accountId: customer.veritransAccountId,
        };

        let couponInfo: CouponInfo;
        if (couponUse) {
          const couponUsed = await this.couponService.useCoupon(
            dto.couponCode.toUpperCase(),
            {
              appTransactionId: reservation._id.toHexString(),
              customerId: customer._id.toHexString(),
              salonId: salon._id.toHexString(),
              servicerId: (salon.owner as Types.ObjectId)?.toHexString(),
              totalPrice: reservationInfo.totalAmount,
              menuId: reservationInfo.menuId.toHexString(),
              bookingDatetime: reservation?.createdAt.toISOString(),
            },
          );
          couponInfo = {
            transactionId: couponUsed.id,
            code: dto.couponCode.toUpperCase(),
            amount: reservationInfo.discountAmount,
          };
        }

        if (reservationInfo.amount > 0) {
          // Create the draft payment transaction
          const paymentData = await this._createPaymentTransaction(
            {
              type: PaymentMethodTypes.CARD,
              accountId: customer.veritransAccountId,
              amount: reservationInfo.amount,
              paymentMethod: dto.paymentMethod,
              metaData: {
                reservationId: reservation._id.toHexString(),
              },
            },
            true,
          );

          paymentInfo = { ...paymentInfo, ...paymentData };
          const payment = await this.paymentService.createNewPaymentRecord(
            {
              transactionId: paymentInfo.transactionId,
              customer: customer._id,
              salon: manipulator.salon[0].salonId,
              reservation: reservation._id,
              paymentMethod: paymentInfo.paymentMethod,
              paymentMethodType: paymentInfo.paymentMethodType,
              status: paymentInfo.status,
              amount: reservationInfo.amount,
              extAccountId: paymentInfo.accountId,
              cardNumber: paymentMethod.details?.lastNumber,
              veritransTransactionId: paymentInfo.veritransTransactionId || '',
            },
            { session },
          );
          paymentInfo.paymentId = payment._id;
        }

        // Update the payment information for reservation
        reservation = await this.reservationRepository.findOneAndUpdate(
          { _id: reservation._id },
          { paymentInfo, couponInfo },
          { session, new: true },
        );

        // Send email for nofifying to customer
        await this.mailService.sendEmailForReservationCreated({
          name: customer.name,
          email: customer.email,
          url: this.configService
            .get<string>('appReservationUrl')
            .replace('[[rId]]', reservation._id.toHexString()),
        });
      });
      session.endSession();

      return {
        reservationId: reservation._id.toHexString(),
      } as CreateReservationOutput;
    } catch (error) {
      // logging the occurred error for investigating.
      const { message: errorMsg, stack } = error;
      this.loggerService.error(
        errorMsg,
        stack,
        JSON.stringify({ ...dto, customerId: customer._id.toHexString() }),
      );

      const { code, message, status } =
        ReservationErrors.CANT_SUBMIT_RESERVATION;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Creating a new reservation with ticket
   *
   * @param {CustomerDocument} customer
   * @param {CreateReservationDto} dto
   * @param {ValidatedReservationData} data
   * @returns {Promise<CreateReservationOutput>}
   */
  public async createNewReservationWithTicket(
    customer: CustomerDocument,
    dto: CreateReservationDto,
    data: ValidatedReservationData,
  ): Promise<CreateReservationOutput> {
    const { manipulator, menu, paymentMethod, salon, ticketUse } = data;

    const transUsed: number[] = [];
    try {
      const session = await this.reservationRepository.startSession();
      let reservations: ReservationDocument[];
      await session.withTransaction(async (session) => {
        const reservationInfo: ReservationInfo = {
          menuId: menu.menuId,
          menuInfo: menu,
          amount: 0,
          totalAmount: menu.price,
          discountAmount: menu.price,
        };

        const reservationCustomerInfo: ReservationCustomerInfo = {
          name: customer.name,
          nameKana: customer.nameKana,
          phone: customer.phone,
          email: customer.email,
        };

        reservations = await Promise.all(
          ticketUse.times.map(async (time) => {
            // Create new reservation
            let reservation = await this.reservationRepository.create(
              {
                customerId: customer._id,
                customerInfo: reservationCustomerInfo,
                manipulator: manipulator._id,
                salon: salon._id,
                startTime: time.startTime,
                endTime: time.endTime,
                cancelDeadline: this.dateUtilService.getTzStartOfDay(
                  time.startTime,
                ),
                plan: reservationInfo,
                result: reservationInfo,
                status: ReservationStatus.RESERVED,
              },
              { session },
            );

            const transation = await this.couponService.useCoupon(
              ticketUse.ticket.code.toUpperCase(),
              {
                appTransactionId: reservation._id.toHexString(),
                totalPrice: 100, //100%
                customerId: customer._id.toHexString(),
                servicerId: (salon.owner as Types.ObjectId).toHexString(),
                menuId: reservationInfo.menuId.toHexString(),
                salonId: salon._id.toHexString(),
                bookingDatetime: reservation.createdAt.toISOString(),
              },
            );
            transUsed.push(transation.id);

            const ticketInfo: TicketInfo = {
              transactionId: transation.id,
              issuedId: transation.issuedCouponId,
              code: ticketUse.ticket.code,
              ticketId: ticketUse.ticket._id,
              ticketUsed: 1,
            };

            // Create the history record
            await this.historyService.createNewHistoryRecord(
              {
                reservation: reservation._id as Types.ObjectId,
                data: reservationInfo,
                status: ReservationStatus.RESERVED,
              },
              { session },
            );

            const paymentInfo: PaymentInfo = dto.paymentMethod
              ? {
                  paymentMethod: dto.paymentMethod,
                  cardNumber: paymentMethod.details?.lastNumber,
                  paymentMethodType: PaymentMethodTypes.CARD,
                  status: PaymentMethodStatuses.DRAFT,
                  accountId: customer.veritransAccountId,
                }
              : null;

            // Update the payment and ticket usage information for reservation
            reservation = await this.reservationRepository.findOneAndUpdate(
              { _id: reservation._id },
              { paymentInfo, ticketInfo },
              { session, new: true },
            );

            // update issued ticket has used
            await this.issuedTicketRepository.findOneAndUpdate(
              { couponIssuedId: transation.issuedCouponId },
              { status: IssuedTicketStatus.USED },
              { session },
            );

            // Send email for nofifying to customer
            await this.mailService.sendEmailForReservationCreated({
              name: customer.name,
              email: customer.email,
              url: this.configService
                .get<string>('appReservationUrl')
                .replace('[[rId]]', reservation._id.toHexString()),
            });

            return reservation;
          }),
        );
      });
      session.endSession();

      return {
        reservationId: reservations[0]._id.toHexString(),
      } as CreateReservationOutput;
    } catch (error) {
      await Promise.all(
        transUsed.map(async (transId) => {
          await this.couponService.cancelTransaction(transId);
        }),
      );

      // logging the occurred error for investigating.
      const { message: errorMsg, stack } = error;
      this.loggerService.error(
        errorMsg,
        stack,
        JSON.stringify({ ...dto, customerId: customer._id.toHexString() }),
      );

      const { code, message, status } =
        ReservationErrors.CANT_SUBMIT_RESERVATION;
      throw new AppException(code, message, status);
    }
  }

  /**
   * get reservation by customer
   *
   * @param {string} customerId
   * @param {PaginateDto} paginationParam
   */
  public async getReservationByCustomer(
    customerId: string,
    paginationParam: PaginateDto,
  ): Promise<GetReservationsByCustomerOutput> {
    const reservations = await this.reservationRepository.pagination({
      conditions: {
        customerId: new Types.ObjectId(customerId),
      },
      populate: ['manipulator', 'salon'],
      ...paginationParam,
    });
    const { docs = [], ...pagination } = reservations;
    const result = new GetReservationsByCustomerOutput();
    const list = docs.map((reservation) => {
      const manipulator = reservation.manipulator as ManipulatorDocument;
      const salon = reservation.salon as SalonDocument;
      const data = new GetReservationItemByCustomerOutput();

      data._id = reservation.id;
      data.manipulatorInfo = {
        manipulatorId: manipulator.id,
        name: manipulator.name,
        nameKana: manipulator.nameKana,
        email: manipulator.email,
        pr: manipulator.pr,
        profile: manipulator.profile,
        photos: manipulator.photos,
      } as ManipulatorInfoOutput;

      data.salonInfo = {
        salonId: salon.id,
        name: salon.name,
        nameKana: salon.nameKana,
        description: salon?.description || '',
      } as SalonInfoOutput;

      data.startTime = reservation.startTime;
      data.endTime = reservation.endTime;
      data.cancelDeadline = reservation.cancelDeadline;
      data.plan = reservation.plan;
      data.result = reservation.result;
      data.couponDiscount = reservation.couponInfo?.amount;
      data.ticketUsed = reservation.ticketInfo?.ticketUsed;
      data.status = reservation.status;

      return data;
    });
    result.docs = list;

    return { ...result, ...pagination };
  }

  /**
   * Validate the date which is submited to create reservation
   *
   * @param {CustomerDocument} customer
   * @param {CreateReservationDto} dto
   * @returns
   */
  private async _validateReservationData(
    customer: CustomerDocument,
    dto: CreateReservationDto,
  ): Promise<ValidatedReservationData> {
    if (dto.couponCode && dto.ticketId) {
      const { code, status, message } =
        ReservationErrors.INVALID_DISCOUNT_METHOD;
      throw new AppException(code, message, status);
    }

    // Checking the customer has already added at least one credit card.
    if (!customer.veritransAccountId) {
      const { code, status, message } =
        ReservationErrors.INVALID_PAYMENT_ACCOUNT;
      throw new AppException(code, message, status);
    }

    const manipulator = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(dto.manipulatorId),
        status: statuses.ACTIVE,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    const menu = manipulator?.menus.find((obj) => {
      return obj.menuId.toHexString() === dto.menuId;
    });
    if (!menu) {
      const { code, status, message } = ReservationErrors.INVALID_MENU;
      throw new AppException(code, message, status);
    }

    const salonId = manipulator.salon[0]?.salonId;
    if (!salonId) {
      const { code, status, message } = Errors.SALON_NOT_EXIST;
      throw new AppException(code, message, status);
    }
    const salon = await this.salonRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(salonId),
        status: SalonStatus.VALID,
      },
      error: Errors.SALON_NOT_EXIST,
    });

    let couponUse = null;
    if (dto.couponCode) {
      const salonId = manipulator.salon[0]?.salonId.toHexString();
      const retCoupon = await this.couponService.getCouponsForReservation(
        customer._id.toHexString(),
        dto.menuId,
        salonId,
      );

      couponUse = retCoupon.items.find(
        (coupon) => coupon.code.toUpperCase() === dto.couponCode.toUpperCase(),
      );
      if (!couponUse) {
        const { code, status, message } = ReservationErrors.INVALID_COUPON;
        throw new AppException(code, message, status);
      }
    }

    let ticketUse = null;
    if (dto.ticketId) {
      const ticket = await this.ticketRepository.findOne({
        conditions: { _id: new Types.ObjectId(dto.ticketId) },
      });
      if (!ticket) {
        const { code, status, message } = ReservationErrors.INVALID_TICKET;
        throw new AppException(code, message, status);
      }

      const retTicket = await this.ticketService.getTicketForReservation(
        customer._id.toHexString(),
        dto.menuId,
        dto.manipulatorId,
      );
      if (
        !retTicket.ticket ||
        dto.ticketUse > retTicket.ticket.availableCount
      ) {
        const { code, status, message } = ReservationErrors.INVALID_TICKET;
        throw new AppException(code, message, status);
      }

      ticketUse = {
        ticket: ticket,
        useCount: dto.ticketUse,
        times: this.dateUtilService.splitTimeRangeByDuration(
          dto.startTime,
          dto.endTime,
          menu.estimatedTime,
        ),
      };
    }

    // Checking the booking time is valid
    const bookingTimeSlots = this.dateUtilService.getTimeSlotsInRange(
      dto.startTime,
      dto.endTime,
    );
    const availableTimeSlots = await this.getAvailableTimeSlotsOfManipulators(
      [dto.manipulatorId],
      dto.startTime,
      dto.endTime,
    );
    if (
      _differenceBy(
        bookingTimeSlots,
        availableTimeSlots.get(dto.manipulatorId) ?? [],
        (date: Date) => date.getTime(),
      ).length > 0
    ) {
      const { code, status, message } =
        ReservationErrors.INVALID_RESERVATION_TIMES;
      throw new AppException(code, message, status);
    }

    const paymentMethod = await this._getPaymentMethod(
      customer.veritransAccountId,
      dto.paymentMethod,
    );
    if (!paymentMethod) {
      const { code, status, message } =
        ReservationErrors.INVALID_PAYMENT_ACCOUNT;
      throw new AppException(code, message, status);
    }

    const estTime = ticketUse
      ? menu.estimatedTime * ticketUse.useCount
      : menu.estimatedTime;
    if (
      estTime !== this.dateUtilService.diffInMinutes(dto.startTime, dto.endTime)
    ) {
      const { code, status, message } = ReservationErrors.INVALID_MENU_DURATION;
      throw new AppException(code, message, status);
    }

    return {
      couponUse,
      ticketUse,
      manipulator,
      paymentMethod,
      menu,
      salon,
    } as ValidatedReservationData;
  }

  /**
   * get available slots of manipulator for booking
   *
   * @param {string[]} manipulatorIds
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Date[]>}
   */
  async getAvailableTimeSlotsOfManipulators(
    manipulatorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Map<string, Date[]>> {
    // retrieving daily schedules of manipulator in the date range
    const startTime = this.dateUtilService.getTzStartOfDay(startDate);
    const endTime = this.dateUtilService.getTzEndOfDay(endDate);
    const manIds = manipulatorIds.map((id) => new Types.ObjectId(id));

    // retrieving the reservations of manipulator in the date range
    const reservations = await this.reservationRepository.find({
      conditions: {
        manipulator: { $in: manIds },
        startTime: { $gte: startTime },
        endTime: { $lte: endTime },
        status: ReservationStatus.RESERVED,
      },
    });

    const availableSlots =
      await this.dailyScheduleService.getScheduleSlotsOfManipulators(
        manipulatorIds,
        startDate,
        endDate,
      );

    // removing the reserved slots out of the available slots
    for (const reservation of reservations) {
      const manId = (reservation.manipulator as Types.ObjectId).toHexString();
      const reservedSlots = this.dateUtilService.getTimeSlotsInRange(
        reservation.startTime,
        reservation.endTime,
      );

      availableSlots.set(
        manId,
        _differenceBy(availableSlots.get(manId), reservedSlots, (date: Date) =>
          date.getTime(),
        ),
      );
    }

    return availableSlots;
  }

  /**
   * Creating the payment transactions
   *
   * @param params
   * @returns {Promise<PaymentInfo>}
   */
  private async _createPaymentTransaction<
    Input extends {
      type: string;
      accountId: string;
      amount: number;
      paymentMethod: string;
      metaData?: Record<string, string>;
    },
  >(params: Input, reserveBalance = false): Promise<PaymentInfo> {
    const result = await this.paymentService.createTransaction(
      params.type,
      params.accountId,
      params.amount,
      params.metaData || {},
    );

    if (!reserveBalance) {
      return { ...result };
    }

    const confirmResult = await this.paymentService.confirmTransaction(
      result.transactionId,
      {
        settleMethod: 'MANUAL',
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        metaData: params.metaData || {},
      },
    );

    return { ...confirmResult };
  }

  /**
   * checking the payment method is valid
   *
   * @param {string} veritransId
   * @param {string} paymentMethod
   * @returns
   */
  private async _getPaymentMethod(veritransId: string, paymentMethod: string) {
    const methods = await this.paymentService.getPaymentMethods(
      veritransId,
      PaymentMethodTypes.CARD,
    );
    if (!methods || methods.items.length === 0) {
      return false;
    }

    const pMethod = methods.items.find((method) => paymentMethod === method.id);

    return pMethod;
  }

  /**
   *
   * @param {string} id
   * @param {string} customerId
   * @returns {Promise} ReservationDetail
   */
  async getReservationDetail(
    id: string,
    customerId: string,
  ): Promise<ReservationDetail> {
    const result = await this.reservationRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(id),
        customerId: new Types.ObjectId(customerId),
      },
      selectedFields: [
        '_id',
        'customerId',
        'customerInfo',
        'manipulator',
        'salon',
        'startTime',
        'endTime',
        'cancelDeadline',
        'plan',
        'result',
        'status',
        'ticketInfo',
        'couponInfo',
      ],
      populates: [{ path: 'manipulator' }, { path: 'salon' }],
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });
    const manipulator = result.manipulator as ManipulatorDocument;
    const salon = result.salon as SalonDocument;
    const data = new ReservationDetail();

    data._id = result.id;
    data.startTime = result.startTime;
    data.endTime = result.endTime;
    data.cancelDeadline = result.cancelDeadline;
    data.plan = result.plan;
    data.result = result.result;
    data.customerId = result.customerId.toString();
    data.customerInfo = result.customerInfo;
    const manipulatorInfo = {
      manipulatorId: manipulator.id,
      name: manipulator.name,
      nameKana: manipulator.nameKana,
      email: manipulator.email,
      pr: manipulator.pr,
      profile: manipulator.profile,
      photos: manipulator.photos,
    } as ManipulatorInfoOutput;

    data.manipulatorInfo = manipulatorInfo;
    const salonInfo = {
      salonId: salon.id,
      name: salon.name,
      nameKana: salon.nameKana,
      description: salon?.description || '',
    } as SalonInfoOutput;

    data.salonInfo = salonInfo;
    data.ticketUsed = result.ticketInfo?.ticketUsed;
    data.couponDiscount = result.couponInfo?.amount;
    data.status = result.status;

    return data;
  }

  /**
   *
   * @param {string} manipulatorId
   * @param {Date} date
   * @param {PaginateDto} paginationParam
   * @returns {Promise} ReservationList
   */
  async getReservationListByManipulator(
    manipulatorId: string,
    date: Date,
    paginationParam: PaginateDto,
  ): Promise<ReservationList> {
    const manipulatorDoc = await this.manipulatorRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(manipulatorId) },
      error: Errors.ACCOUNT_NOT_EXIST,
    });
    const startTime = this.dateUtilService.getTzStartOfDay(date);
    const endTime = this.dateUtilService.getTzEndOfDay(date);
    const conditions = {
      startTime: { $gte: startTime },
      endTime: { $lte: endTime },
    };
    const salons = manipulatorDoc.salon || [];
    const salonOwner = salons.find((salon) => salon.authority === 'owner');
    if (salonOwner) {
      conditions['salon'] = salonOwner.salonId;
    } else {
      conditions['manipulator'] = new Types.ObjectId(manipulatorId);
    }
    const reservations = await this.reservationRepository.pagination({
      conditions,
      selectedFields: [
        '_id',
        'customerId',
        'customerInfo',
        'manipulator',
        'salon',
        'startTime',
        'endTime',
        'cancelDeadline',
        'plan',
        'result',
        'status',
        'ticketInfo',
        'couponInfo',
      ],
      populate: ['manipulator', 'salon'],
      ...paginationParam,
    });

    const { docs = [], ...pagination } = reservations;
    const result = new ReservationList();
    const list = docs.map((reservation) => {
      const manipulator = reservation.manipulator as ManipulatorDocument;
      const salon = reservation.salon as SalonDocument;
      const data = new ReservationItem();

      data._id = reservation.id;
      data.customerId = reservation.customerId.toString();
      data.customerInfo = reservation.customerInfo;
      data.manipulatorInfo = {
        manipulatorId: manipulator.id,
        name: manipulator.name,
        nameKana: manipulator.nameKana,
        email: manipulator.email,
        pr: manipulator.pr,
        profile: manipulator.profile,
        photos: manipulator.photos,
      } as ManipulatorInfoOutput;

      data.salonInfo = {
        salonId: salon.id,
        name: salon.name,
        nameKana: salon.nameKana,
        description: salon?.description || '',
      } as SalonInfoOutput;

      data.startTime = reservation.startTime;
      data.endTime = reservation.endTime;
      data.cancelDeadline = reservation.cancelDeadline;
      data.plan = reservation.plan;
      data.result = reservation.result;
      data.ticketUsed = reservation.ticketInfo?.ticketUsed;
      data.couponDiscount = reservation.couponInfo?.amount;
      data.status = reservation.status;

      return data;
    });
    result.docs = list;

    return { ...result, ...pagination };
  }
  /**
   *
   * @param {string} id
   * @param {string} manipulatorId
   * @returns {Promise} ReservationDetail
   */
  async getReservationDetailByManipulator(
    id: string,
    manipulatorId: string,
  ): Promise<ReservationDetail> {
    const manipulatorDoc = await this.manipulatorRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(manipulatorId) },
      error: Errors.ACCOUNT_NOT_EXIST,
    });
    const salons = manipulatorDoc.salon || [];
    const salonOwner = salons.find((salon) => salon.authority === 'owner');

    const conditions = {
      _id: new Types.ObjectId(id),
    };
    if (salonOwner) {
      conditions['salon'] = salonOwner.salonId;
    } else {
      conditions['manipulator'] = new Types.ObjectId(manipulatorId);
    }
    const doc = await this.reservationRepository.firstOrFail({
      conditions,
      selectedFields: [
        '_id',
        'customerId',
        'customerInfo',
        'manipulator',
        'salon',
        'startTime',
        'endTime',
        'cancelDeadline',
        'plan',
        'result',
        'status',
        'ticketInfo',
        'couponInfo',
      ],
      populates: [
        { path: 'manipulator' },
        { path: 'salon' },
        {
          path: 'treatment',
          select: ['_id', 'treatmentInfo', 'treatmentFile'],
        },
      ],
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });
    const manipulator = doc.manipulator as ManipulatorDocument;
    const salon = doc.salon as SalonDocument;
    const data = new ReservationDetail();

    data._id = doc.id;
    data.startTime = doc.startTime;
    data.endTime = doc.endTime;
    data.cancelDeadline = doc.cancelDeadline;
    data.plan = doc.plan;
    data.result = doc.result;
    data.customerId = doc.customerId.toString();
    data.customerInfo = doc.customerInfo;
    const manipulatorInfo = {
      manipulatorId: manipulator.id,
      name: manipulator.name,
      nameKana: manipulator.nameKana,
      email: manipulator.email,
      pr: manipulator.pr,
      profile: manipulator.profile,
      photos: manipulator.photos,
    } as ManipulatorInfoOutput;

    data.manipulatorInfo = manipulatorInfo;
    const salonInfo = {
      salonId: salon.id,
      name: salon.name,
      nameKana: salon.nameKana,
      description: salon?.description || '',
    } as SalonInfoOutput;

    data.salonInfo = salonInfo;
    data.treatmentInfo = doc.treatment;
    data.ticketUsed = doc.ticketInfo?.ticketUsed;
    data.couponDiscount = doc.couponInfo?.amount;
    data.status = doc.status;

    return data;
  }

  /**
   * Complete the reservation
   *
   * @param {ManipulatorDocument} loggedUser
   * @param {CreateReservationDto} dto
   * @returns {Promise<boolean>}
   */
  public async completeReservation(
    reservationId: string,
    dto: CompleteReservationDto,
    loggedUser?: ManipulatorDocument | undefined,
    checkStartDate = true,
  ): Promise<boolean> {
    const reservation = await this.reservationRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(reservationId) },
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });
    if (reservation.status !== ReservationStatus.RESERVED) {
      const { code, status, message } =
        ReservationErrors.INVALID_RESERVATION_STATUS;
      throw new AppException(code, message, status);
    }

    // validate the date to complete the reservation
    if (
      checkStartDate &&
      this.dateUtilService.isBeforeDate(reservation.startTime)
    ) {
      const { code, status, message } =
        ReservationErrors.CAN_NOT_COMPLETE_BEFORE_DATE;
      throw new AppException(code, message, status);
    }

    const manipulator = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: reservation.manipulator,
        status: statuses.ACTIVE,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    const customer = await this.customerRepository.firstOrFail({
      conditions: {
        _id: reservation.customerId,
        status: statuses.ACTIVE,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    // validate the salon owner if the reservation is not belong to manipulator
    if (
      loggedUser &&
      loggedUser._id.toHexString() !== reservation.manipulator.toString()
    ) {
      const salonOwner = loggedUser.salon.find(
        (salon) => salon.authority === 'owner',
      );
      if (
        salonOwner?.salonId.toHexString() !==
        manipulator.salon[0].salonId.toHexString()
      ) {
        const { code, status, message } = CommonErrors.PERMISSION_DENIED;
        throw new AppException(code, message, status);
      }
    }

    // validate the payment method (credit card) is still valid and not be removed yet
    let paymentInfo = reservation.paymentInfo;
    const paymentMethod = await this._getPaymentMethod(
      paymentInfo.accountId,
      paymentInfo.paymentMethod,
    );
    if (!paymentMethod) {
      const { code, status, message } =
        ReservationErrors.INVALID_PAYMENT_ACCOUNT;
      throw new AppException(code, message, status);
    }

    const menu = manipulator?.menus.find(
      (obj) => obj.menuId.toHexString() === dto.menuId,
    );
    if (!menu) {
      const { code, status, message } = ReservationErrors.INVALID_MENU;
      throw new AppException(code, message, status);
    }

    try {
      const session = await this.reservationRepository.startSession();
      await session.withTransaction(async (session) => {
        let discountAmount = 0;
        // complete the using coupon transaction
        if (reservation.couponInfo && reservation.couponInfo.transactionId) {
          discountAmount = reservation.couponInfo.amount;
          await this.couponService.completeTransaction(
            reservation.couponInfo.transactionId,
            {
              appTransactionId: reservation._id.toHexString(),
              customerId: customer._id.toHexString(),
              code: reservation.couponInfo.code,
            },
          );
        }

        // complete the using ticket transaction
        if (reservation.ticketInfo && reservation.ticketInfo.transactionId) {
          discountAmount = dto.amount; // 100% discount
          await this.couponService.completeTransaction(
            reservation.ticketInfo.transactionId,
            {
              appTransactionId: reservation._id.toHexString(),
              customerId: reservation.customerId.toHexString(),
              code: reservation.ticketInfo.code,
            },
          );
          if (reservation.ticketInfo.issuedId) {
            // update issued ticket has used
            await this.issuedTicketRepository.findOneAndUpdate(
              { couponIssuedId: reservation.ticketInfo.issuedId },
              { status: IssuedTicketStatus.COMPLETED },
              { session },
            );
          }
        }

        const settledAmount =
          dto.amount > discountAmount ? dto.amount - discountAmount : 0;

        // Just complete for zero amount once the payment transaction have been reserved balance
        if (
          paymentInfo.status === PaymentMethodStatuses.HOLD ||
          settledAmount > 0
        ) {
          // complete the payment transaction with amount
          const newPaymentInfo = await this._completePaymentTransaction(
            paymentInfo,
            settledAmount,
            paymentInfo.metaData,
          );

          if (newPaymentInfo.paymentId) {
            // update the payment status and settled amount
            await this.paymentService.updatePaymentRecord(
              newPaymentInfo.paymentId.toHexString(),
              {
                status: newPaymentInfo.status,
                amount: newPaymentInfo.amount,
              },
              { session },
            );
          } else {
            const payment = await this.paymentService.createNewPaymentRecord(
              {
                transactionId: newPaymentInfo.transactionId,
                customer: customer._id,
                salon: manipulator.salon[0].salonId,
                reservation: reservation._id,
                paymentMethod: paymentInfo.paymentMethod,
                paymentMethodType: paymentInfo.paymentMethodType,
                status: newPaymentInfo.status,
                amount: newPaymentInfo.amount,
                extAccountId: paymentInfo.accountId,
                cardNumber: paymentInfo.cardNumber,
                veritransTransactionId:
                  newPaymentInfo.veritransTransactionId || '',
              },
              { session },
            );
            paymentInfo.paymentId = payment._id;
          }

          paymentInfo = { ...paymentInfo, ...newPaymentInfo };
        }

        // store the treatment history for the customer
        const treatment = await this.treatmentService.createHistoryRecord(
          {
            salon: reservation.salon as Types.ObjectId,
            manipulator: reservation.manipulator as Types.ObjectId,
            customer: reservation.customerId,
            reservation: reservation._id,
            treatmentInfo: dto.treatmentInfo,
            treatmentFile: dto.treatmentFile
              ? await this._populateFileUrl(dto.treatmentFile, { session })
              : undefined,
          },
          { session },
        );

        const reservationData: ReservationInfo = {
          menuId: new Types.ObjectId(dto.menuId),
          menuInfo: menu,
          amount: settledAmount,
          totalAmount: dto.amount,
          discountAmount: discountAmount,
        };

        let endTime = reservation.endTime;
        if (
          reservationData.menuId.toHexString() !==
          reservation.plan.menuId.toHexString()
        ) {
          endTime = moment(reservation.startTime)
            .add(menu.estimatedTime, 'minutes')
            .toDate();
        }

        // update the reservation record
        const updatedReservation =
          await this.reservationRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(reservationId) },
            {
              $set: {
                'result.menuId': reservationData.menuId,
                'result.menuInfo': reservationData.menuInfo,
                'result.amount': reservationData.amount,
                'result.totalAmount': reservationData.totalAmount,
                'result.discountAmount': reservationData.discountAmount,
              },
              treatment: treatment._id,
              paymentInfo: paymentInfo,
              endTime: endTime,
              status: ReservationStatus.DONE,
            },
            { session, new: true },
          );

        // Create the reservation record
        await this.saleService.createSaleRecord(updatedReservation, {
          session,
        });

        // Create the history record
        await this.historyService.createNewHistoryRecord(
          {
            reservation: reservation._id as Types.ObjectId,
            data: reservationData,
            status: ReservationStatus.DONE,
          },
          { session },
        );

        // Send email for nofifying to customer
        await this.mailService.sendEmailForReservationDone({
          customerName: customer.name,
          manipulatorName: manipulator.name,
          salonName: manipulator.salon[0]?.name,
          email: customer.email,
          url: this.configService
            .get<string>('appReservationUrl')
            .replace('[[rId]]', reservation._id.toHexString()),
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
          loggedUser: loggedUser._id.toHexString(),
        }),
      );

      if (error instanceof AppException) {
        throw error;
      } else {
        const { code, message, status } =
          ReservationErrors.CANT_COMPLETE_RESERVATION;
        throw new AppException(code, message, status);
      }
    }
  }

  /**
   * Creating new reservation from the specified reservation
   *
   * @param {string} reservationId
   * @param {CreateNextReservationDto} dto
   * @param {ManipulatorDocument} loggedUser
   *
   * @returns Promise<CreateReservationOutput>
   */
  public async createNextReservation(
    reservationId: string,
    dto: CreateNextReservationDto,
    loggedUser?: ManipulatorDocument | undefined,
  ): Promise<CreateReservationOutput> {
    const reservation = await this.reservationRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(reservationId) },
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });

    const customer = await this.customerRepository.firstOrFail({
      conditions: { _id: reservation.customerId, status: statuses.ACTIVE },
      error: CommonErrors.OBJECT_NOT_FOUND,
    });

    if (reservation.manipulator.toString() !== loggedUser._id.toString()) {
      const ownSalon = loggedUser.salon?.find((s) => s.authority === 'owner');

      if (
        !ownSalon ||
        ownSalon.salonId.toHexString() !== reservation.salon.toString()
      ) {
        const { code, status, message } = CommonErrors.PERMISSION_DENIED;
        throw new AppException(code, message, status);
      }
    }

    return this.createNewReservation(
      customer,
      {
        manipulatorId: reservation.manipulator.toString(),
        paymentMethod: reservation.paymentInfo.paymentMethod,
        menuId: dto.menuId,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
      dto.amount,
    );
  }

  /**
   * Complete the payment transaction
   *
   * @param {paymentInfo} paymentInfo
   * @param {numbet} amount
   * @param {Record<string, string>} metaData
   * @returns {Promise<PaymentInfo>}
   */
  private async _completePaymentTransaction(
    paymentInfo: PaymentInfo,
    amount: number,
    metaData?: Record<string, string>,
  ): Promise<PaymentInfo> {
    if (paymentInfo.status === PaymentMethodStatuses.HOLD) {
      // in case the transaction have reserved balance of credit card
      if (amount === 0) {
        const result = await this.paymentService.cancelTransaction(
          paymentInfo.transactionId,
          { metaData },
        );
        return { ...result };
      }

      const result = await this.paymentService.captureTransaction(
        paymentInfo.transactionId,
        {
          amount,
          metaData,
        },
      );

      return { ...result };
    }

    if (!paymentInfo.transactionId) {
      const paymentData = await this._createPaymentTransaction({
        type: paymentInfo.paymentMethodType,
        accountId: paymentInfo.accountId,
        amount: amount,
        paymentMethod: paymentInfo.paymentMethod,
        metaData: paymentInfo.metaData,
      });
      paymentInfo = { ...paymentInfo, ...paymentData };
    }

    const result = await this.paymentService.confirmTransaction(
      paymentInfo.transactionId,
      {
        settleMethod: 'AUTOMATIC',
        paymentMethod: paymentInfo.paymentMethod,
        amount,
        metaData,
      },
    );

    return { ...result };
  }

  /**
   * Populating the file url
   *
   * @param {TreatmentFile} file
   * @returns
   */
  private async _populateFileUrl(
    file: TreatmentFile,
    options?: QueryOptions | undefined,
  ): Promise<TreatmentFile> {
    file.fileUrl = this.s3Service.getPublicUrlInS3(file.objectKey);

    await this.fileRepository.updateFileStatus(
      [file.objectKey],
      undefined,
      options,
    );
    return file;
  }

  async findReservations(
    params: OperatorGetReservationListInput,
    paginationParam: PaginateDto,
  ): Promise<OperatorFindReservationsOutput> {
    const reservations = await this.reservationRepository.search({
      fromReservationDate: params.from,
      toReservationDate: params.to,
      status: params.status,
      keyword: params.keyword,
      skip: (paginationParam.page - 1) * paginationParam.limit,
      limit: paginationParam.limit,
      sort: paginationParam.sort,
    });

    const { docs = [], ...pagination } = reservations;
    const result = new OperatorFindReservationsOutput();
    const list = docs.map((item) => {
      const reservation = item;
      const manipulator = reservation.manipulatorData as ManipulatorDocument;
      const salon = reservation.salonData as SalonDocument;
      const data = new OperatorFindReservationItem();

      data._id = reservation.id;
      data.reservationDate = reservation.startTime;
      data.updatedAt = reservation.updatedAt;
      data.salonName = salon?.nameKana ?? salon?.name;
      data.manipulatorName = manipulator.nameKana ?? (manipulator.name || '');
      data.customerName =
        reservation.customerInfo.nameKana ?? reservation.customerInfo.name;
      reservation.customerInfo.nameKana ?? reservation.customerInfo.name;
      data.totalAmount = reservation.result.totalAmount;
      data.status = reservation.status;
      return data;
    });

    result.docs = list;
    const dataPaging = this.commonUtilsService.calcPaginateData(
      pagination.skip,
      pagination.limit,
      pagination.totalDocs,
    );
    return { ...result, ...dataPaging };
  }

  /**
   *
   * @param {string} id
   * @returns {Promise} OperatorReservationDetail
   */
  async findById(id: string): Promise<OperatorReservationDetail> {
    const result = await this.reservationRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(id),
      },
      selectedFields: [
        '_id',
        'customerId',
        'customerInfo',
        'manipulator',
        'salon',
        'startTime',
        'endTime',
        'cancelDeadline',
        'plan',
        'result',
        'status',
        'paymentInfo',
        'ticketInfo',
        'couponInfo',
      ],
      populates: [
        { path: 'manipulator' },
        { path: 'salon' },
        {
          path: 'paymentInfo.paymentId',
          model: 'Payment',
          select: 'updatedAt',
        },
      ],
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });
    const manipulator = result.manipulator as ManipulatorDocument;
    const salon = result.salon as SalonDocument;
    const data = new OperatorReservationDetail();

    data._id = result.id;
    data.startTime = result.startTime;
    data.endTime = result.endTime;
    data.cancelDeadline = result.cancelDeadline;
    data.menuName = result.result.menuInfo.name;
    data.estimatedTime = result.result.menuInfo.estimatedTime;

    data.status = result.status;
    data.customerId = result.customerId.toString();
    data.customerInfo = result.customerInfo;
    const manipulatorInfo = {
      manipulatorId: manipulator.id,
      name: manipulator.name,
      nameKana: manipulator.nameKana,
      email: manipulator.email,
    } as OperatorManipulatorInfoOutput;
    data.manipulatorInfo = manipulatorInfo;

    const salonInfo = {
      salonId: salon.id,
      name: salon.name,
      nameKana: salon.nameKana,
      phone: salon.phone,
      description: salon?.description || '',
    } as OperatorSalonInfoOutput;

    data.salonInfo = salonInfo;

    const paymentInfo: OperatorPaymentInfo = {
      paymentMethodType: result.paymentInfo.paymentMethodType,
      cardNumber: result.paymentInfo.cardNumber?.substring(0, 4) || '',
      transactionId: result.paymentInfo.veritransTransactionId || '',
      amount: result.paymentInfo.amount,
      status: result.paymentInfo.status,
      paymentDate:
        result.paymentInfo.status === PaymentMethodStatuses.SETTLED
          ? (result.paymentInfo.paymentId as any).updatedAt
          : null,
    };
    data.paymentInfo = paymentInfo;
    data.totalAmount = result.result.totalAmount;
    data.discountAmount = result.result.discountAmount;
    data.ticketUse = result.ticketInfo?.ticketUsed;
    data.couponDiscount = result.couponInfo?.amount;

    return data;
  }

  /**
   * Operator Complete the reservation
   *
   * @returns {Promise<boolean>}
   */
  public async operatorCompleteReservation(
    reservationId: string,
  ): Promise<boolean> {
    const reservation = await this.reservationRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(reservationId) },
      error: ReservationErrors.RESERVATION_NOT_EXIST,
    });
    if (reservation.status !== ReservationStatus.RESERVED) {
      const { code, status, message } =
        ReservationErrors.INVALID_RESERVATION_STATUS;
      throw new AppException(code, message, status);
    }

    // validate the payment method (credit card) is still valid and not be removed yet
    let paymentInfo = reservation.paymentInfo;
    const paymentMethod = await this._getPaymentMethod(
      paymentInfo.accountId,
      paymentInfo.paymentMethod,
    );
    if (!paymentMethod) {
      const { code, status, message } =
        ReservationErrors.INVALID_PAYMENT_ACCOUNT;
      throw new AppException(code, message, status);
    }

    const amount = reservation.plan.amount;
    try {
      const session = await this.reservationRepository.startSession();
      await session.withTransaction(async (session) => {
        // complete the using coupon transaction
        if (reservation.couponInfo && reservation.couponInfo.transactionId) {
          await this.couponService.completeTransaction(
            reservation.couponInfo.transactionId,
            {
              appTransactionId: reservation._id.toHexString(),
              customerId: reservation.customerId.toHexString(),
              code: reservation.couponInfo.code,
            },
          );
        }

        if (reservation.ticketInfo && reservation.ticketInfo.transactionId) {
          await this.couponService.completeTransaction(
            reservation.ticketInfo.transactionId,
            {
              appTransactionId: reservation._id.toHexString(),
              customerId: reservation.customerId.toHexString(),
              code: reservation.ticketInfo.code,
            },
          );
          if (reservation.ticketInfo.issuedId) {
            // update issued ticket has used
            await this.issuedTicketRepository.findOneAndUpdate(
              { couponIssuedId: reservation.ticketInfo.issuedId },
              { status: IssuedTicketStatus.COMPLETED },
              { session },
            );
          }
        }
        const settledAmount = amount;

        if (
          paymentInfo.status === PaymentMethodStatuses.HOLD ||
          settledAmount > 0
        ) {
          // complete the payment transaction with amount
          const newPaymentInfo = await this._completePaymentTransaction(
            paymentInfo,
            settledAmount,
            paymentInfo.metaData,
          );

          // update the payment status and settled amount
          await this.paymentService.updatePaymentRecord(
            paymentInfo.paymentId.toHexString(),
            {
              status: newPaymentInfo.status,
              amount: newPaymentInfo.amount,
            },
            { session },
          );

          paymentInfo = { ...paymentInfo, ...newPaymentInfo };
        }

        // update the reservation record
        const updatedReservation =
          await this.reservationRepository.findOneAndUpdate(
            { _id: new Types.ObjectId(reservationId) },
            {
              paymentInfo: paymentInfo,
              status: ReservationStatus.DONE,
            },
            { session, new: true },
          );

        // Create the reservation record
        await this.saleService.createSaleRecord(updatedReservation, {
          session,
        });

        // Create the history record
        await this.historyService.createNewHistoryRecord(
          {
            reservation: reservation._id as Types.ObjectId,
            status: ReservationStatus.DONE,
          },
          { session },
        );
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
          loggedUser: 'Operator',
        }),
      );

      if (error instanceof AppException) {
        throw error;
      } else {
        const { code, message, status } =
          ReservationErrors.CANT_COMPLETE_RESERVATION;
        throw new AppException(code, message, status);
      }
    }
  }
}
