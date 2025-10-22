import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AppException } from '@src/common/exceptions/app.exception';
import { PaymentMethodStatuses, PaymentMethodTypes } from '../contracts/type';

export interface IMethodItemDetail {
  kind: string;
  expireMonth: string;
  expireYear: string;
  lastNumber: string;
  default: boolean;
  brand: string;
}

export interface IMethodItem {
  id: string;
  kind: string;
  type: string;
  details: IMethodItemDetail;
}

export interface IGetMethodOutput {
  items: IMethodItem[];
}

export interface IAddMethodOutput {
  customerId: string;
}

export interface IUpdateMethodInput {
  type: string;
  customer: string;
  details: {
    defaultCard?: boolean;
    cardExpire?: string;
    securityCode?: string;
  };
}

export interface ICreateTransactionInput {
  type: string;
  accountId: string;
  amount: number;
  metaData?: Record<string, string>;
}

export interface ICancelTransactionInput {
  metaData?: Record<string, string>;
}

export interface ICaptureTransactionInput {
  amount: number;
  metaData?: Record<string, string>;
}

export interface ITransactionOutput {
  transactionId: string;
  paymentMethodType: PaymentMethodTypes;
  paymentMethod?: string;
  accountId: string;
  amount: number;
  metaData: Record<string, string>;
  status: PaymentMethodStatuses;
  veritransTransactionId?: string;
}

export type SettleMethod = 'MANUAL' | 'AUTOMATIC';
export interface IConfirmTransactionInput {
  settleMethod: SettleMethod;
  paymentMethod: string;
  amount: number;
  metaData?: Record<string, string>;
}

@Injectable()
export class VeritransService {
  protected baseUrl: string;
  protected token: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('paymentApiUrl');
  }

  private _getBaseConfig(): any {
    return {
      headers: {
        Authorization: `Bearer ${this._generateAuthToken()}`,
      },
    };
  }

  /**
   * Get payment methods
   *
   * @param {string} customerId The customer ID from Veritrans
   * @param {string} type The type of payment method
   * @returns {Promise<IOutput>}
   */
  async getPaymentMethods(
    customerId: string | undefined,
    type: string,
  ): Promise<IGetMethodOutput> {
    if (!customerId) {
      return { items: [] } as IGetMethodOutput;
    }

    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}payment-methods?customer=${customerId}&type=${type}`,
          this._getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return response.data;
  }

  /**
   * Adding the payment methods to customer
   *
   * @param {string} type The type of payment method
   * @param {string} customerId The customer ID from Veritrans
   * @param {string} token The encoded token from Veritrans
   * @returns {Promise<IAddMethodOutput>}
   */
  async addPaymentMethod(
    type: string,
    customerId: string | undefined,
    token: string,
  ): Promise<IAddMethodOutput> {
    const payload = { type, customer: customerId, details: { token } };
    const { data: response } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}payment-methods`, payload, this._getBaseConfig())
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return { customerId: response.data.customerId } as IAddMethodOutput;
  }

  /**
   * Update the payment methods to customer
   *
   * @param {string} methodId The payment method ID from Veritrans
   * @param {object} data The updating data
   * @returns {Promise<boolean>}
   */
  async updatePaymentMethod(
    methodId: string,
    data: IUpdateMethodInput,
  ): Promise<boolean> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .put(
          `${this.baseUrl}payment-methods/${methodId}`,
          data,
          this._getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return response.data.status === 'success';
  }

  /**
   * Remove the payment methods to customer
   *
   * @param {string} type The type of payment method
   * @param {string} customerId The customer ID from Veritrans
   * @param {string} methodId The method ID from Veritrans
   * @returns {Promise<boolean>}
   */
  async removePaymentMethod(
    type: string,
    customerId: string,
    methodId: string,
  ): Promise<boolean> {
    const payload = { type, customer: customerId };
    const baseConfigs = this._getBaseConfig();
    baseConfigs.data = payload;
    const { data: response } = await firstValueFrom(
      this.httpService
        .delete(`${this.baseUrl}payment-methods/${methodId}`, baseConfigs)
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return response.data.status === 'success';
  }

  /**
   * Update the payment methods to customer
   *
   * @param {ICreateTransactionInput} data The updating data
   * @returns {Promise<ITransactionOutput>}
   */
  async createTransaction(
    data: ICreateTransactionInput,
  ): Promise<ITransactionOutput> {
    const payload = {
      type: data.type,
      customer: data.accountId,
      amount: data.amount,
      metaData: data.metaData || {},
    };
    const { data: response } = await firstValueFrom(
      this.httpService
        .post(`${this.baseUrl}payments`, payload, this._getBaseConfig())
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return {
      transactionId: response.data._id,
      accountId: response.data.customer,
      metaData: response.data.metaData,
      amount: response.data.amount,
      status: response.data.status,
      paymentMethodType: response.data.paymentMethodType,
      veritransTransactionId: response.data.providerData?.orderId,
    } as ITransactionOutput;
  }

  /**
   * Cancel the payment transaction
   *
   * @param {string} transactionId The transaction Id
   * @param {ICancelTransactionInput} data The cancel data
   * @returns {Promise<ITransactionOutput>}
   */
  async cancelTransaction(
    transactionId: string,
    data: ICancelTransactionInput,
  ): Promise<ITransactionOutput> {
    try {
      const { data: response } = await firstValueFrom(
        this.httpService
          .post(
            `${this.baseUrl}payments/${transactionId}/cancel`,
            { ...data },
            this._getBaseConfig(),
          )
          .pipe(
            catchError((error) => {
              throw this._throwError(error);
            }),
          ),
      );

      return {
        transactionId: response.data._id,
        accountId: response.data.customer,
        metaData: response.data.metaData,
        amount: response.data.amount,
        status: response.data.status,
        paymentMethodType: response.data.paymentMethodType,
        veritransTransactionId: response.data.providerData?.orderId,
      } as ITransactionOutput;
    } catch (error) {
      if (error.code === 'PAYMENT_CANCEL_CAN_NOT_CHANGE_STATUS') {
        const transaction = await this.getTransactionById(transactionId);
        if (transaction.status === PaymentMethodStatuses.CANCELED) {
          return transaction;
        }
      }

      throw error;
    }
  }

  /**
   * get the payment transaction by id
   *
   * @param {string} transactionId The transaction Id
   * @returns {Promise<ITransactionOutput>}
   */
  async getTransactionById(transactionId: string): Promise<ITransactionOutput> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}payments/${transactionId}`, this._getBaseConfig())
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return {
      transactionId: response.data._id,
      accountId: response.data.customer,
      metaData: response.data.metaData,
      amount: response.data.amount,
      status: response.data.status,
      paymentMethodType: response.data.paymentMethodType,
      paymentMethod: response.data.paymentMethod,
      veritransTransactionId: response.data.providerData?.orderId,
    } as ITransactionOutput;
  }

  /**
   * Confirm the payment transaction
   *
   * @param {string} transactionId The transaction Id
   * @param {IConfirmTransactionInput} data The updating data
   * @returns {Promise<ITransactionOutput>}
   */
  async confirmTransaction(
    transactionId: string,
    data: IConfirmTransactionInput,
  ): Promise<ITransactionOutput> {
    const payload = {
      settleMethod: data.settleMethod,
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      metaData: data.metaData || {},
    };

    try {
      const { data: response } = await firstValueFrom(
        this.httpService
          .post(
            `${this.baseUrl}payments/${transactionId}/confirm`,
            payload,
            this._getBaseConfig(),
          )
          .pipe(
            catchError((error) => {
              throw this._throwError(error);
            }),
          ),
      );

      return {
        transactionId: response.data._id,
        accountId: response.data.customer,
        metaData: response.data.metaData,
        amount: response.data.amount,
        status: response.data.status,
        paymentMethodType: response.data.paymentMethodType,
        paymentMethod: response.data.paymentMethod,
        veritransTransactionId: response.data.providerData?.orderId,
      } as ITransactionOutput;
    } catch (error) {
      if (
        data.settleMethod === 'AUTOMATIC' &&
        error.code === 'PAYMENT_CONFIRM_CAN_NOT_CHANGE_STATUS'
      ) {
        const transaction = await this.getTransactionById(transactionId);
        if (transaction.status === PaymentMethodStatuses.SETTLED) {
          return transaction;
        }
      }

      throw error;
    }
  }

  /**
   * Capture the payment transaction
   *
   * @param {string} transactionId The transaction Id
   * @param {ICaptureTransactionInput} data The updating data
   * @returns {Promise<ITransactionOutput>}
   */
  async captureTransaction(
    transactionId: string,
    data: ICaptureTransactionInput,
  ): Promise<ITransactionOutput> {
    const payload = {
      amount: data.amount,
      metaData: data.metaData || {},
    };

    try {
      const { data: response } = await firstValueFrom(
        this.httpService
          .post(
            `${this.baseUrl}payments/${transactionId}/capture`,
            payload,
            this._getBaseConfig(),
          )
          .pipe(
            catchError((error) => {
              throw this._throwError(error);
            }),
          ),
      );

      return {
        transactionId: response.data._id,
        accountId: response.data.customer,
        metaData: response.data.metaData,
        amount: response.data.amountCaptured,
        status: response.data.status,
        paymentMethodType: response.data.paymentMethodType,
        paymentMethod: response.data.paymentMethod,
        veritransTransactionId: response.data.providerData?.orderId,
      } as ITransactionOutput;
    } catch (error) {
      if (error.code === 'PAYMENT_CONFIRM_CAN_NOT_CHANGE_STATUS') {
        const transaction = await this.getTransactionById(transactionId);
        if (transaction.status === PaymentMethodStatuses.SETTLED) {
          return transaction;
        }
      }

      throw error;
    }
  }

  /**
   * Generating the auth token for requesting to the payment service
   *
   * @returns {string}
   */
  private _generateAuthToken(): string {
    const keyPass = this.configService.get<string>('paymentPrivateKeyPasswd');
    const expiresIn = this.configService.get<string>('paymentTokenExpiresIn');
    const privateKey = Buffer.from(
      this.configService.get<string>('paymentPrivateKey'),
      'base64',
    ).toString();

    return jwt.sign(
      { appName: 'Manipulator' },
      { key: privateKey, passphrase: keyPass },
      { algorithm: 'RS256', expiresIn: expiresIn },
    );
  }

  /**
   * Handling the error repsonse
   *
   * @param error
   */
  private _throwError(error: any) {
    if (error.response) {
      const response = error.response;
      const { code, message } = response.data.error;
      return new AppException(
        code ? `PAYMENT_ERROR:${code}` : 'PAYMENT_ERROR',
        message,
        response.status,
      );
    } else {
      const { code, message, status } = error;
      return new AppException(
        code ? `PAYMENT_ERROR:${code}` : 'PAYMENT_ERROR',
        message,
        status,
      );
    }
  }
}
