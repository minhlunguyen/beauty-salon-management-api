import { OtpService } from './otp.services';
import { Injectable } from '@nestjs/common';
import { Errors } from '@src/account/contracts/error';
import {
  Customer,
  CustomerDocument,
} from '@src/account/schemas/customer.schema';
import { AppException } from '@src/common/exceptions/app.exception';
import { CustomerRegisterDto } from '../dtos/customer-register.dto';
import { CustomerRepository } from '../repositories/customer.repository';
import { AuthServiceInterface } from '@src/auth/interfaces/auth-service.interface';
import { statuses } from '@src/account/schemas/customer.schema';
import { VerificationService } from '@src/common/services/verification.service';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { AuthToken } from '../contracts/type';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import { TokenService } from '@src/auth/services/token.services';
import { JwtService } from '@nestjs/jwt';
import { PaymentMethodTypes } from '@src/payment/contracts/type';
import { PaymentService } from '@src/payment/services/payment.service';
import { OperatorCustomerDetail } from '@src/account/contracts/openapi';
import { MethodItem } from '@src/payment/contracts/openapi';
import { DateUtilService } from '@src/common/services/date-utils.service';
import {
  OperatorFindCustomerItem,
  OperatorFindCustomersInput,
  OperatorFindCustomersOutput,
} from '../dtos/operator-find-customer.dto';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import { Types } from 'mongoose';
import { AppLogger } from '@src/common/services/app-logger.service';
import * as _ from 'lodash';

@Injectable()
export class CustomerService implements AuthServiceInterface {
  constructor(
    private customerRepository: CustomerRepository,
    private otpService: OtpService,
    private verificationService: VerificationService,
    private configService: ConfigService,
    private tokenService: TokenService,
    private jwtService: JwtService,
    private commonUtilsService: CommonUtilService,
    private paymentService: PaymentService,
    private dateUtilService: DateUtilService,
    private loggerService: AppLogger,
  ) {}

  /**
   * Send otp to the registration user
   * @param {SendOtpDto} otpDto
   * @returns
   */
  async sendOtpToRegister(otpDto: SendOtpDto) {
    const entity = await this.customerRepository.findOne({
      conditions: { phone: otpDto.phoneNumber },
    });

    if (entity) {
      const { code, message, status } = Errors.PHONE_EXIST;
      throw new AppException(code, message, status);
    }

    return this.otpService.sendOtp(otpDto);
  }

  /**
   *
   * @param data
   */
  async register(
    data: CustomerRegisterDto,
  ): Promise<Customer & { authToken?: AuthToken }> {
    const isValidToken = await this.otpService.verifyOtpJwtToken(
      data.phone,
      data.token,
    );
    if (!isValidToken) {
      const { code, message, status } = Errors.INVALID_TOKEN;
      throw new AppException(code, message, status);
    }
    const entity = await this.customerRepository.findOne({
      conditions: { $or: [{ email: data.email }, { phone: data.phone }] },
    });
    if (entity) {
      const { code, message, status } = Errors.EMAIL_OR_PHONE_EXIST;
      throw new AppException(code, message, status);
    }

    const customer = await this.customerRepository.create(data);
    return this._populateAuthToken(customer);
  }

  /**
   *
   * @param updatedData
   * @param customerId
   * @returns
   */
  async update(
    customerId: string,
    updatedData: Partial<CustomerDocument>,
  ): Promise<CustomerDocument> {
    const conditions = { _id: customerId };
    const options = { new: true };
    const entity = await this.customerRepository.findOneAndUpdate(
      conditions,
      updatedData,
      options,
    );
    return entity;
  }

  /**
   * @param {Record<any, any>} conditions
   * @param {Partial<CustomerDocument>} updatedData
   * @returns
   */
  async updateByConditions(
    conditions: Record<any, any>,
    updatedData: Partial<CustomerDocument>,
  ): Promise<CustomerDocument> {
    const options = { new: true };
    const entity = await this.customerRepository.findOneAndUpdate(
      conditions,
      updatedData,
      options,
    );
    return entity;
  }

  /**
   * Validate customer user
   *
   * @param {T<{ identity, password }>} data
   * @returns Promise<Record<string, any>>
   */
  async validateUser({ identity, password }) {
    const entity = await this.customerRepository.firstOrFail({
      conditions: {
        phone: identity,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    if (entity.status !== statuses.ACTIVE) {
      const { code, message, status } = Errors.ACCOUNT_IS_NOT_ACTIVE;
      throw new AppException(code, message, status);
    }

    const isValid = await this.verificationService.checkVerificationToken(
      identity,
      password,
    );
    if (isValid) {
      return { _id: entity._id.toString() };
    }
    const { code, message, status } = Errors.INVALID_PASSWORD;
    throw new AppException(code, message, status);
  }

  /**
   * Get logged user information
   *
   * @param {string} _id The ID of customer user
   * @returns {Promise<Document>}
   */
  async getAuthenticationUser(_id: string) {
    const entity = await this.customerRepository.firstOrFail({
      conditions: {
        _id: _id,
      },
    });
    if (entity.status !== statuses.ACTIVE) {
      const { code, message, status } = Errors.ACCOUNT_IS_NOT_ACTIVE;
      throw new AppException(code, message, status);
    }

    return entity;
  }

  /**
   * Check the user is existed
   *
   * @param {string} identity The identifier of customer user
   * @returns {Promise<CustomerDocument>}
   */
  async checkUserExisted(identity: string): Promise<CustomerDocument> {
    const entity = await this.customerRepository.firstOrFail({
      conditions: {
        phone: identity,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    return entity;
  }

  /**
   *
   * @param paginationParam
   * @returns
   */
  async getCustomerList(
    params: OperatorFindCustomersInput,
    paginationParam: PaginateDto,
  ): Promise<OperatorFindCustomersOutput> {
    const customers = await this.customerRepository.search({
      fromRegisterDate: params.from,
      toRegisterDate: params.to,
      status: params.status,
      keyword: params.keyword,
      skip: (paginationParam.page - 1) * paginationParam.limit,
      limit: paginationParam.limit,
      sort: paginationParam.sort,
    });

    const { docs = [], ...pagination } = customers;
    const result = new OperatorFindCustomersOutput();

    const list = docs.map((item) => {
      const customer = item as CustomerDocument;

      const data = new OperatorFindCustomerItem();
      data._id = customer.id;
      data.name = customer.nameKana ?? customer.name;
      data.email = customer.email;
      data.phone = customer.phone;
      data.status = customer.status;
      data.createdAt = _.get(customer, 'createdAt');
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
   * Finding the customer by Id
   *
   * @param {string} id
   * @returns Promise<CustomerDocument>
   */
  async findById(id: string): Promise<CustomerDocument> {
    return this.customerRepository.firstOrFail({
      conditions: {
        _id: id,
      },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'email',
        'phone',
        'birthday',
        'gender',
        'status',
        'emailVerified',
        'createdAt',
        'updatedAt',
      ],
      error: Errors.ACCOUNT_NOT_EXIST,
    });
  }

  /**
   *  Login as customer then return authentication token
   *
   * @param {CustomerDocument} customer
   * @returns {Promise<Customer & { authToken?: AuthToken }>}
   */
  async _populateAuthToken(
    customer: CustomerDocument,
  ): Promise<Customer & { authToken?: AuthToken }> {
    const deviceId = nanoid();
    const role = 'customer';
    const expiresIn = this.configService.get('jwtTokenExpiresIn');
    const refreshToken = await this.tokenService.createOrUpdateToken({
      role,
      userId: customer._id,
      deviceId,
    });

    return {
      ...customer.toObject(),
      authToken: {
        accessToken: this.jwtService.sign(
          { sub: customer._id, authRole: role },
          {
            expiresIn,
          },
        ),
        refreshToken: refreshToken.token,
        deviceId,
      },
    };
  }

  /**
   * checking the payment method is valid
   *
   * @param {string} veritransId
   * @param {string} paymentMethod
   * @returns {MethodItem}
   */
  private async _getPaymentInfo(veritransId: string): Promise<MethodItem> {
    try {
      const methods = await this.paymentService.getPaymentMethods(
        veritransId,
        PaymentMethodTypes.CARD,
      );
      if (!methods || methods.items.length === 0) {
        return null;
      }
      const methodItem = methods.items.find(
        (method) => method.details.default === true,
      );
      if (!methodItem) {
        methodItem == methods.items[0];
      }
      return methodItem;
    } catch (error) {
      this.loggerService.error(error);
      return null;
    }
  }

  /**
   *
   * @param {string} id
   * @returns Promise<OperatorCustomerDetail>
   */
  async operatorGetDetailCustomer(id: string): Promise<OperatorCustomerDetail> {
    const customerEntity: CustomerDocument =
      await this.customerRepository.firstOrFail({
        conditions: {
          _id: new Types.ObjectId(id),
        },
        selectedFields: [
          '_id',
          'name',
          'nameKana',
          'email',
          'phone',
          'status',
          'veritransAccountId',
          'createdAt',
        ],
        error: Errors.ACCOUNT_NOT_EXIST,
      });
    const data = new OperatorCustomerDetail();
    data.name = customerEntity.name;
    data.nameKana = customerEntity.nameKana;
    data.status = customerEntity.status;
    data.email = customerEntity.email;
    data.phone = customerEntity.phone;
    if (customerEntity.createdAt) {
      data.registryDate = this.dateUtilService.utcToLocalTime(
        customerEntity.createdAt,
        'YYYY/MM/DD',
      );
    }

    if (customerEntity.veritransAccountId) {
      const cardInfo = await this._getPaymentInfo(
        customerEntity.veritransAccountId.toString(),
      );
      if (cardInfo) {
        data.CardNumber = cardInfo.details.lastNumber?.substring(0, 4) || '';
        data.CardExpire =
          cardInfo.details.expireMonth + '/' + cardInfo.details.expireYear;
      }
    }
    const lastLoginTime: string = await this.tokenService.getLastTimeLogin(
      'customer',
      id,
    );
    data.lastLogin = lastLoginTime;
    return data;
  }
}
