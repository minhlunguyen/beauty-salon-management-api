import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppException } from '@src/common/exceptions/app.exception';
import * as jwt from 'jsonwebtoken';
import { catchError, firstValueFrom } from 'rxjs';
import {
  ICouponOutput,
  ICreateCouponInput,
  IIssueCouponInput,
  IIssueCouponOutput,
  IUpdateCouponInput,
  IQueryOptions,
  IAvailableQueryOptions,
  IIssuedCoupon,
  IPaginationOutput,
  IAvailableCouponOutput,
  IUseCouponInput,
  IUseCouponOutput,
  ITransactionQueryOptions,
  ITransactionOutput,
  CouponStatus,
} from '../contracts/interfaces';
import { ParsedUrlQueryInput, stringify as _qsStringify } from 'querystring';
import * as uniqid from 'uniqid';

@Injectable()
export class C2cCouponService {
  protected baseUrl: string;
  protected token: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const serviceUrl = this.configService.get<string>('couponServiceApiUrl');
    this.baseUrl = `https://${serviceUrl}/`;
  }

  /**
   * Get api base configuration
   * @returns object
   */
  public getBaseConfig() {
    return {
      headers: {
        Authorization: this._generateAuthToken(),
      },
    };
  }

  /**
   * Get coupon list
   *
   * @param {IQueryOptions} input The customer ID
   * @returns {Promise<IPaginationOutput<ICouponOutput>>}
   */
  async getCoupons(
    input: IQueryOptions = {},
  ): Promise<IPaginationOutput<ICouponOutput>> {
    const qs = _qsStringify(input as ParsedUrlQueryInput);
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(`${this.baseUrl}application/coupons?${qs}`, this.getBaseConfig())
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    const { total, perPage, page, lastPage } = response.data;
    return {
      items: response.data.coupons,
      total: +total,
      perPage,
      page,
      lastPage,
    };
  }

  /**
   * Get coupon list
   *
   * @param {number} couponId The coupon ID
   * @returns {Promise<ICouponOutput>}
   */
  async getCouponById(couponId: number): Promise<ICouponOutput> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}application/coupons/${couponId}`,
          this.getBaseConfig(),
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
   * Create a new coupon
   *
   * @param {ICreateCouponInput} couponInput The input data
   * @returns {Promise<ICouponOutput>}
   */
  async createCoupon(couponInput: ICreateCouponInput): Promise<ICouponOutput> {
    if (!couponInput.code) couponInput.code = uniqid();

    const { data: response } = await firstValueFrom(
      this.httpService
        .post(
          `${this.baseUrl}application/coupons`,
          { coupon: { ...couponInput } },
          this.getBaseConfig(),
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
   * Assign tags to coupon
   *
   * @param {number} couponId The coupon Id
   * @param {number[]} tags The tag Ids
   *
   * @returns {Promise<ICouponOutput>}
   */
  async assignTags(couponId: number, tags: number[]): Promise<ICouponOutput> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .put(
          `${this.baseUrl}application/coupons/${couponId}/tags`,
          { tags: tags },
          this.getBaseConfig(),
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
   * Update a specified coupon
   *
   * @param {IUpdateCouponInput} couponInput The input data
   * @returns {Promise<ICouponOutput>}
   */
  async updateCoupon(
    id: number,
    couponInput: IUpdateCouponInput,
  ): Promise<ICouponOutput> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .put(
          `${this.baseUrl}application/coupons/${id}`,
          { coupon: { ...couponInput } },
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return response.data;
  }

  /*
   * Delete a specified coupon
   *
   * @returns {Promise<ICouponOutput>}
   */
  async deleteCoupon(id: number): Promise<boolean> {
    await firstValueFrom(
      this.httpService
        .delete(
          `${this.baseUrl}application/coupons/${id}`,
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );
    return true;
  }

  /*
   * Delete a specified coupon
   *
   * @returns {Promise<ICouponOutput>}
   */
  async changeCouponStatus(id: number, status: CouponStatus): Promise<boolean> {
    await firstValueFrom(
      this.httpService
        .patch(
          `${this.baseUrl}application/coupons/${id}/status`,
          { status },
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );
    return true;
  }

  /**
   * Issue the coupon
   *
   * @param {IIssueCouponInput} input The input data
   * @returns {Promise<IIssueCouponOutput>}
   */
  async issueCoupon(input: IIssueCouponInput): Promise<IIssueCouponOutput> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .post(
          `${this.baseUrl}application/coupons/issue`,
          { ...input },
          this.getBaseConfig(),
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
   * Issue the coupon
   *
   * @param {IQueryOptions} input The input data
   * @returns {Promise<IPaginationOutput<IIssuedCoupon>>}
   */
  async getIssuedCoupons(
    input: IQueryOptions = {},
  ): Promise<IPaginationOutput<IIssuedCoupon>> {
    const qs = _qsStringify(input as ParsedUrlQueryInput);
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}application/coupons/issued?${qs}`,
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    const { total, perPage, page, lastPage } = response.data;
    return {
      items: response.data.issuedCoupons,
      total: +total,
      perPage,
      page,
      lastPage,
    };
  }

  /**
   * Issue the coupon
   *
   * @param {IIssueCouponInput} input The input data
   * @returns {Promise<IPaginationOutput<IAvailableCouponOutput>>}
   */
  async getIssuedAvailableCoupons(
    input: IAvailableQueryOptions,
  ): Promise<IPaginationOutput<IAvailableCouponOutput>> {
    const qs = _qsStringify(input as unknown as ParsedUrlQueryInput);
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}application/coupons/available?${qs}`,
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    const { total, perPage, page, lastPage } = response.data;
    return {
      items: response.data.coupons,
      total: +total,
      perPage,
      page,
      lastPage,
    };
  }

  /**
   * Using the coupon
   *
   * @param {string} code The coupon code
   * @param {IUseCouponInput} input
   * @returns {Promise<IUseCouponOutput>}
   */
  async useCoupon(
    code: string,
    input: IUseCouponInput,
  ): Promise<IUseCouponOutput> {
    input.serviceUsageCount = input.serviceUsageCount || 1;
    const { data: response } = await firstValueFrom(
      this.httpService
        .put(
          `${this.baseUrl}application/coupons/${code}/using`,
          { ...input },
          this.getBaseConfig(),
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
   * Get transaction list
   *
   * @param {ITransactionQueryOptions} input The query data
   * @returns {Promise<IPaginationOutput<ITransactionOutput>>}
   */
  async getTransactions(
    input: ITransactionQueryOptions = {},
  ): Promise<IPaginationOutput<ITransactionOutput>> {
    const qs = _qsStringify(input as ParsedUrlQueryInput);
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}application/transactions?${qs}`,
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    const { total, perPage, page, lastPage } = response.data;
    return {
      items: response.data.transactions,
      total: +total,
      perPage,
      page,
      lastPage,
    };
  }

  /**
   * Complete the transaction
   *
   * @param {number} transactionId The transaction id
   * @returns {Promise<boolean>}
   */
  async completeTransaction(transactionId: number): Promise<boolean> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .patch(
          `${this.baseUrl}application/transactions/${transactionId}/status/complete`,
          {},
          this.getBaseConfig(),
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
   * Cancelling the transaction
   *
   * @param {number} transactionId The transaction id
   * @returns {Promise<boolean>}
   */
  async cancelTransaction(transactionId: number): Promise<boolean> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .patch(
          `${this.baseUrl}application/transactions/${transactionId}/status/cancel`,
          {},
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    return response.code === '200';
  }

  /**
   * Complete the transaction
   *
   * @param {string} customerId The customer id
   * @returns {Promise<boolean>}
   */
  async getTransactionByCode(
    appTransactionId: string,
    customerId: string,
    code: string,
  ): Promise<ITransactionOutput | undefined> {
    const { data: response } = await firstValueFrom(
      this.httpService
        .get(
          `${this.baseUrl}application/transactions?customerId=${customerId}&code=${code}`,
          this.getBaseConfig(),
        )
        .pipe(
          catchError((error) => {
            throw this._throwError(error);
          }),
        ),
    );

    if (response.data.transactions.length === 0) {
      return undefined;
    }

    return response.data.transactions.find(
      (trans: ITransactionOutput) =>
        trans.couponCode === code &&
        trans.appTransactionId === appTransactionId,
    );
  }

  /**
   * Generating the auth token for requesting to the coupon service
   *
   * @returns {string}
   */
  private _generateAuthToken(): string {
    const appId = this.configService.get<string>('couponServiceAppId');
    const appCode = this.configService.get<string>('couponServiceAppCode');
    const expiresIn = this.configService.get<string>('couponTokenExpiresIn');
    const secretKey = this.configService.get<string>('couponServiceSecretKey');
    const serviceUrl = this.configService.get<string>('couponServiceApiUrl');

    return jwt.sign({ id: appId, name: appCode }, secretKey, {
      algorithm: 'HS256',
      expiresIn: expiresIn,
      issuer: serviceUrl,
      audience: serviceUrl,
    });
  }

  /**
   * Handling the error repsonse
   *
   * @param error
   */
  private _throwError(error: any) {
    if (error.response?.data) {
      const { code, error: message } = error.response.data;
      return new AppException(
        code ? `COUPON_ERROR:${code}` : 'COUPON_ERROR',
        message,
        code,
      );
    } else {
      const { code, message, status } = error;
      return new AppException(
        code ? `COUPON_ERROR:${code}` : 'COUPON_ERROR',
        message,
        status,
      );
    }
  }
}
