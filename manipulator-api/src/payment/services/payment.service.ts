import { Injectable } from '@nestjs/common';
import { AddPaymentMethodDto } from '../dtos/add-payment-method.dto';
import {
  ICancelTransactionInput,
  ICaptureTransactionInput,
  IConfirmTransactionInput,
  ITransactionOutput,
  VeritransService,
} from './veritrans.service';
import { RemovePaymentMethodDto } from '../dtos/remove-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dtos/update-payment-method.dto';
import { AddCardOutput, MethodItems } from '../contracts/openapi';
import { PaymentDocument } from '../schemas/payment.schema';
import { PaymentRepository } from '../repositories/payment.repository';
import { QueryOptions, Types } from 'mongoose';
import { PaymentMethodTypes } from '../contracts/type';
import { CustomerRepository } from '@src/account/repositories/customer.repository';
import { ReservationRepository } from '@src/reservation/repositories/reservation.repository';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '../contracts/error';

@Injectable()
export class PaymentService {
  constructor(
    private veritransService: VeritransService,
    private paymentRepository: PaymentRepository,
    private customerRepository: CustomerRepository,
    private reservationRepository: ReservationRepository,
  ) {}

  /**
   * Listing of added payment methods of the user
   *
   * @param {string} veritransId
   * @returns
   */
  async getPaymentMethods(
    veritransId: string | undefined,
    type: string,
  ): Promise<MethodItems> {
    return this.veritransService.getPaymentMethods(veritransId, type);
  }

  /**
   * Adding new payment method
   *
   * @param {string} userId
   * @param {string} veritransId
   * @param {AddCardDto} data
   * @returns {Promise<boolean>}
   */
  async addPaymentMethod(
    userId: string,
    veritransId: string | undefined,
    data: AddPaymentMethodDto,
    returnList = false,
  ): Promise<AddCardOutput> {
    const result = await this.veritransService.addPaymentMethod(
      data.type,
      veritransId,
      data.token,
    );

    if (!veritransId && result.customerId) {
      await this.customerRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        {
          veritransAccountId: result.customerId,
        },
      );
    }

    const response: AddCardOutput = {
      isCreated: true,
    };
    if (returnList) {
      response.items =
        (
          await this.getPaymentMethods(
            result.customerId,
            PaymentMethodTypes.CARD,
          )
        )?.items || [];
    }

    return response;
  }

  /**
   * Remove payment method
   *
   * @param {string} veritransId The customer ID from Veritrans
   * @param {string} methodId The payment method ID from Veritrans
   * @param {RemovePaymentMethodDto} data The payload data
   * @returns {Promise<boolean>}
   */
  async removePaymentMethod(
    veritransId: string,
    methodId: string,
    data: RemovePaymentMethodDto,
  ): Promise<boolean> {
    if (await this.reservationRepository.isPaymentMethodInReserved(methodId)) {
      const { code, message, status } = Errors.THE_CARD_IN_RESERVED;
      throw new AppException(code, message, status);
    }

    return this.veritransService.removePaymentMethod(
      data.type,
      veritransId,
      methodId,
    );
  }

  /**
   * Update the payment method
   *
   * @param {string} veritransId The customer ID from Veritrans
   * @param {string} methodId The payment method ID from Veritrans
   * @param {UpdatePaymentMethodDto} data The payload data
   * @returns {Promise<boolean>}
   */
  async updatePaymentMethod(
    veritransId: string,
    methodId: string,
    data: UpdatePaymentMethodDto,
  ): Promise<boolean> {
    return this.veritransService.updatePaymentMethod(methodId, {
      type: data.type,
      customer: veritransId,
      details: data.details,
    });
  }

  /**
   * Creating the payment transaction
   *
   * @param {string} type The payment type
   * @param {string} accountId The payment method ID from Veritrans
   * @param {number} amount The amount number
   * @param {Record<string, string>} metadata The meta data
   * @returns {Promise<ITransactionOutput>}
   */
  async createTransaction(
    type: string,
    accountId: string,
    amount: number,
    metaData?: Record<string, string>,
  ): Promise<ITransactionOutput> {
    return this.veritransService.createTransaction({
      type,
      accountId,
      amount,
      metaData,
    });
  }

  /**
   * Cancel the payment transaction
   *
   * @param {string} transactionId The transaction ID
   * @param {ICancelTransactionInput} data The meta data
   * @returns {Promise<ITransactionOutput>}
   */
  async cancelTransaction(
    transactionId: string,
    data: ICancelTransactionInput,
  ): Promise<ITransactionOutput> {
    return this.veritransService.cancelTransaction(transactionId, data);
  }

  /**
   * Confirm the payment transaction
   *
   * @param {string} transactionId The transaction ID
   * @param {IConfirmTransactionInput} data The meta data
   * @returns {Promise<ITransactionOutput>}
   */
  async confirmTransaction(
    transactionId: string,
    data: IConfirmTransactionInput,
  ): Promise<ITransactionOutput> {
    return this.veritransService.confirmTransaction(transactionId, data);
  }

  /**
   * Capture the payment transaction
   *
   * @param {string} transactionId The transaction ID
   * @param {ICaptureTransactionInput} data The meta data
   * @returns {Promise<ITransactionOutput>}
   */
  async captureTransaction(
    transactionId: string,
    data: ICaptureTransactionInput,
  ): Promise<ITransactionOutput> {
    return this.veritransService.captureTransaction(transactionId, data);
  }

  /**
   * Create new payment record
   *
   * @param {Partial<PaymentDocument>} data
   * @return {Promise<PaymentDocument>}
   */
  async createNewPaymentRecord(
    data: Partial<PaymentDocument>,
    options?: QueryOptions | undefined,
  ): Promise<PaymentDocument> {
    return this.paymentRepository.create(data, options);
  }

  /**
   * Create new payment record
   *
   * @param {Partial<PaymentDocument>} data
   * @return {Promise<PaymentDocument>}
   */
  async updatePaymentRecord(
    paymentId: string,
    data: Partial<PaymentDocument>,
    options?: QueryOptions | undefined,
  ): Promise<PaymentDocument> {
    return this.paymentRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(paymentId) },
      data,
      options,
    );
  }
  /**
   * make payment for ticket
   *
   * @param {string} veritransAccountId
   * @param {string} paymentMethod
   * @param {amount} amount
   * @param {Record<string, string>} metaDataPayment
   * @return {Promise<PaymentDocument>} metaDataPayment
   */
  async makePaymentTicket(
    veritransAccountId: string,
    paymentMethod: string,
    amount: number,
    metaData: Record<string, string>,
  ): Promise<ITransactionOutput> {
    const paymentTransaction = await this.veritransService.createTransaction({
      type: PaymentMethodTypes.CARD,
      accountId: veritransAccountId,
      amount: amount,
      metaData: metaData,
    });

    const confirmTransactionData: IConfirmTransactionInput = {
      settleMethod: 'AUTOMATIC',
      paymentMethod: paymentMethod,
      amount: amount,
    };
    return await this.veritransService.confirmTransaction(
      paymentTransaction.transactionId,
      confirmTransactionData,
    );
  }
}
