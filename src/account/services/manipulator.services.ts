import { SalonDocument } from '@src/salon/schemas/salon.schema';
import { Injectable } from '@nestjs/common';
import { ManipulatorRepository } from '../repositories/manipulator.repository';
import { SalonRepository } from '../../salon/repositories/salon.repository';
import { FilterQuery, QueryOptions, Types, UpdateQuery } from 'mongoose';
import {
  Manipulator,
  ManipulatorDocument,
  ManipulatorType,
  statuses,
} from '../schemas/manipulator.schema';
import { ManipulatorOwnerRegisterDto } from '../dtos/manipulator-owner-register.dto';
import { ManipulatorNormalRegisterDto } from '../dtos/manipulator-normal-register.dto';
import { Errors } from '../contracts/error';
import { AppException } from '@src/common/exceptions/app.exception';
import { ManipulatorRegisterConfirmDto } from '../dtos/manipulator-register-confirm-dto.dto';
import { MailerService } from '@src/notification/services/mailer.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SearchManipulatorDto } from '../dtos/search-manipulator-dto.dto';
import { Photo, Symptom } from '@src/salon/contracts/value-object';
import { SymptomRepository } from '@src/salon/repositories/symptom.repository';
import { S3Service } from '@src/media/services/s3.service';
import * as bcrypt from 'bcrypt';
import { AuthServiceInterface } from '@src/auth/interfaces/auth-service.interface';
import {
  ManipulatorsBySalonItemResponse,
  ManipulatorsBySalonResponse,
} from '../dtos/manipulators-by-salon.dto';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { DailyScheduleService } from '@src/schedule/services/daily-schedule.service';
import { MenuStatus } from '@src/salon/contracts/type';
import { FileRepository } from '@src/media/repositories/file.repository';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { ReservationService } from '@src/reservation/services/reservation.service';
import { ManipulatorConfirmNewEmailDto } from '../dtos/manipulator-confirm-new-email.dto';
import { ManipulatorChangeEmailDto } from '../dtos/manipulator-change-email.dto';

@Injectable()
export class ManipulatorService implements AuthServiceInterface {
  constructor(
    private manipulatorRepository: ManipulatorRepository,
    private salonRepository: SalonRepository,
    private mailerService: MailerService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private symptomRepository: SymptomRepository,
    private s3Service: S3Service,
    private dailyScheduleService: DailyScheduleService,
    private fileRepository: FileRepository,
    private dateUtilService: DateUtilService,
    private reservationService: ReservationService,
  ) {}

  /**
   * Sending email to user for confirmation
   *
   * @param {ManipulatorRegisterConfirmDto} dto
   * @returns {Promise<boolean>}
   */
  async verifyEmail(dto: ManipulatorRegisterConfirmDto): Promise<boolean> {
    const isExisted = await this.manipulatorRepository.findOne({
      conditions: {
        email: dto.email,
      },
    });

    if (isExisted) {
      const { code, message, status } = Errors.EMAIL_EXIST;
      throw new AppException(code, message, status);
    }

    const appUrl = this.configService.get<string>('appRegisterUrl');
    const token = await this._generateToken({ email: dto.email });
    const verifyUrl = `${appUrl}?email=${dto.email}&token=${token}`;

    try {
      await this.mailerService.sendRegisterConfirmation(dto.email, verifyUrl);
    } catch (error) {
      const { code, message, status } = Errors.CANT_SEND_EMAIL;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   * Registering salon and manipulator owner
   *
   * @param {ManipulatorOwnerRegisterDto} dto
   * @returns {Promise<boolean>}
   */
  async registerOwner(dto: ManipulatorOwnerRegisterDto): Promise<boolean> {
    const isValid = await this._verifyToken(dto.email, dto.token);
    if (!isValid) {
      const { code, message, status } = Errors.INVALID_TOKEN;
      throw new AppException(code, message, status);
    }

    const isExisted = await this.manipulatorRepository.findOne({
      conditions: {
        email: dto.email,
      },
    });

    if (isExisted) {
      // if the email is already existed, they must register new salon by authorized request
      const { code, message, status } = Errors.EMAIL_EXIST;
      throw new AppException(code, message, status);
    }

    try {
      const session = await this.manipulatorRepository.startSession();
      await session.withTransaction(async (session) => {
        const password = await bcrypt.hash(dto.password, 10);
        const manipulatorData: Manipulator = {
          email: dto.email,
          password: password,
          status: statuses.ACTIVE,
          isPublished: false,
          type: ManipulatorType.OWNER,
        };
        await this.manipulatorRepository.create(manipulatorData, { session });
      });

      session.endSession();
    } catch (error) {
      const { code, message, status } = Errors.CANT_REGISTER_MANIPULATOR;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   *
   * @param data
   * @returns
   */

  async registerNormal(
    salonId: string,
    data: ManipulatorNormalRegisterDto,
  ): Promise<ManipulatorDocument> {
    const isExisted = await this.manipulatorRepository.findOne({
      conditions: {
        email: data.email,
      },
    });

    if (isExisted) {
      const { code, message, status } = Errors.EMAIL_EXIST;
      throw new AppException(code, message, status);
    }

    const salon = await this.salonRepository.findOne({
      conditions: {
        _id: new Types.ObjectId(salonId),
      },
    });
    if (!salon) {
      const { code, message, status } = Errors.SALON_NOT_EXIST;
      throw new AppException(code, message, status);
    }

    if (data.supportedSymptoms) {
      data.supportedSymptoms = await this._populateSymptoms(
        data.supportedSymptoms,
      );
    }

    if (data.photos) {
      data.photos = this._populatePhotoUrl(data.photos);
    }

    try {
      let entity: ManipulatorDocument;

      const session = await this.manipulatorRepository.startSession();
      await session.withTransaction(async (session) => {
        if (data.photos) {
          await this.fileRepository.updateFileStatus(
            data.photos.map((file) => file.objectKey),
            undefined,
            { session },
          );
        }

        const manipulatorData: Manipulator = {
          ...data,
          salon: [
            {
              salonId: new Types.ObjectId(salonId),
              authority: 'normal',
              name: salon.name,
              nameKana: salon.nameKana,
              addresses: salon.addresses,
              businessHours: salon.businessHours,
              access: salon.access || [],
              features: salon.features || [],
              photos: salon.photos || [],
            },
          ],
          status: statuses.ACTIVE,
          type: ManipulatorType.NORMAL,
          isPublished: false,
        };
        entity = await this.manipulatorRepository.create(manipulatorData, {
          session,
        });

        // generating daily schedules from the current date to the end of next month
        await this.dailyScheduleService.generateManipulatorDailySchedulesInMonths(
          entity._id.toHexString(),
          entity?.defaultShifts || [],
          1,
          { session },
        );

        if (data?.verifyEmail === true) {
          await this._sendVerifyEmailToNewManipulator(
            data.email,
            entity._id.toHexString(),
          );
        }
      });
      session.endSession();

      return entity;
    } catch (error) {
      const { code, message, status } = Errors.CANT_REGISTER_MANIPULATOR;
      throw new AppException(code, message, status);
    }
  }
  /**
   * @param paginationParam
   */
  getManipulatorList(paginationParam) {
    return this.manipulatorRepository.pagination({
      ...paginationParam,
      select: [
        '_id',
        'name',
        'nameKana',
        'email',
        'salon',
        'careerStart',
        'nationalLicenses',
        'pr',
        'profile',
        'photos',
        'type',
        'defaultShift',
        'status',
        'isPublished',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * Find one and update the manipulator
   *
   * @param {FilterQuery<ManipulatorDocument>} conditions
   * @param {UpdateQuery<ManipulatorDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<ManipulatorDocument>,
    data: UpdateQuery<ManipulatorDocument>,
    options: QueryOptions | undefined,
  ): Promise<ManipulatorDocument> {
    return await this.manipulatorRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }

  /**
   * Find one and update the manipulator
   *
   * @param {FilterQuery<ManipulatorDocument>} conditions
   * @param {UpdateQuery<ManipulatorDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async updateMany(
    conditions: FilterQuery<ManipulatorDocument>,
    data: UpdateQuery<ManipulatorDocument>,
    options: QueryOptions | undefined,
  ) {
    return await this.manipulatorRepository.updateMany(
      conditions,
      data,
      options,
    );
  }

  /**
   * Searching manipulator rely on query parameters
   *
   * @param {SearchManipulatorDto} searchDto
   * @returns
   */
  async search(searchDto: SearchManipulatorDto): Promise<any[]> {
    return this.manipulatorRepository.search({ ...searchDto });
  }

  /**
   * Searching manipulator rely on query parameters
   *
   * @param {SearchManipulatorDto} searchDto
   * @returns
   */
  async find(searchDto: SearchManipulatorDto, { page, limit, sort }) {
    const filters = { ...searchDto };
    if (searchDto.date) {
      filters['notIn'] =
        await this.dailyScheduleService.getManipulatorIdsInDayOff(
          searchDto.date,
        );
    }

    const result = await this.manipulatorRepository.findMatchingManipulators(
      { ...filters },
      { page, limit, sort },
    );

    const manipulatorIds = result.docs.map((man) => man._id.toHexString());
    const currentDate = searchDto.date
      ? searchDto.date
      : this.dateUtilService.getTzStartOfDay(new Date());
    const dailySchedules =
      await this.reservationService.getAvailableTimeSlotsOfManipulators(
        manipulatorIds,
        currentDate,
        currentDate,
      );

    result.docs = result.docs.map((doc: any) => {
      const data = doc.toObject();
      const menus = data.menus.filter(
        (menu) => menu.status === MenuStatus.Public,
      );

      let timeSlots = [];
      if (dailySchedules.get(data._id.toHexString())) {
        timeSlots = dailySchedules.get(doc._id.toHexString());
      }

      data.salon = data.salon.map((salon) => ({
        salonId: salon.salonId,
        name: salon.name,
        nameKana: salon.nameKana,
        access: salon.access,
        features: salon.features,
        photos: salon.photos,
      }));

      return { ...data, menus, timeSlots };
    });

    return result;
  }

  /**
   * Generating a Jwt token for a valid email
   *
   * @param {string} email
   * @returns
   */
  private async _generateToken(
    payload: Record<any, any>,
    expires?: string,
  ): Promise<string> {
    const expiresIn =
      expires ?? this.configService.get('registerTokenExpiresIn');
    return this.jwtService.sign(payload, { expiresIn });
  }

  /**
   * Verifying the token is valid
   *
   * @param {string} email
   * @param {string} token
   * @returns Promise<boolean>
   */
  private async _verifyToken(email: string, token: string): Promise<boolean> {
    try {
      const data = await this.jwtService.verify(token);
      return data.email === email;
    } catch (error) {
      return false;
    }
  }

  /**
   *
   * @param updatedData
   * @param manipulatorId
   * @returns
   */
  async update(
    manipulatorId: string,
    updatedData: Partial<ManipulatorDocument>,
  ): Promise<boolean> {
    const conditions = { _id: manipulatorId };
    const manipulator = await this.manipulatorRepository.firstOrFail({
      conditions,
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    manipulator.name = updatedData.name ?? manipulator.name;
    manipulator.nameKana = updatedData.nameKana ?? manipulator.nameKana;
    manipulator.defaultShifts =
      updatedData.defaultShifts ?? manipulator.defaultShifts;
    manipulator.careerStart =
      updatedData.careerStart ?? manipulator.careerStart;
    manipulator.nationalLicenses =
      updatedData.nationalLicenses ?? manipulator.nationalLicenses;
    manipulator.profile = updatedData.profile ?? manipulator.profile;
    manipulator.pr = updatedData.pr ?? manipulator.pr;
    manipulator.supportedSymptoms = updatedData.supportedSymptoms
      ? await this._populateSymptoms(updatedData.supportedSymptoms)
      : manipulator.supportedSymptoms;

    try {
      const session = await this.manipulatorRepository.startSession();
      await session.withTransaction(async (session) => {
        if (updatedData.photos) {
          updatedData.photos = this._populatePhotoUrl(updatedData.photos);
          await this.fileRepository.updateFileStatus(
            updatedData.photos.map((file) => file.objectKey),
            manipulator.photos?.map((file) => file.objectKey),
            { session },
          );
          manipulator.photos = updatedData.photos;
        }

        await this.manipulatorRepository.findOneAndUpdate(
          conditions,
          updatedData,
          { new: true, session },
        );
      });

      session.endSession();

      return true;
    } catch (error) {
      const { code, message, status } = Errors.CANT_UPDATE_MANIPULATOR;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Populating master data for features
   *
   * @param {Feature[]} data
   * @param {QueryOptions| undefined} options
   * @returns
   */
  private async _populateSymptoms(
    data: Symptom[],
    options?: QueryOptions | undefined,
  ) {
    const ids = data.map((symptom) => symptom.id);
    const features = await this.symptomRepository.find({
      conditions: { _id: ids },
      options: options,
    });

    if (features.length) {
      data = features.map((symptom) => ({
        id: parseInt(symptom.id),
        name: symptom.symptomName,
      }));
    } else {
      data = [];
    }

    return data;
  }

  /**
   * Populating the photo url
   *
   * @param {Photo[]} data
   * @returns
   */
  private _populatePhotoUrl(data: Photo[]): Photo[] {
    const populated = [];
    for (const photo of data) {
      photo.url = this.s3Service.getPublicUrlInS3(photo.objectKey);
      populated.push(photo);
    }

    return populated;
  }

  /**
   * Finding the manipulator by Id
   *
   * @param {string} id
   * @returns Promise<ManipulatorDocument>
   */
  async findById(id: string): Promise<ManipulatorDocument> {
    return this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: id,
      },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'email',
        'salon',
        'careerStart',
        'nationalLicenses',
        'supportedSymptoms',
        'pr',
        'profile',
        'photos',
        'menus',
        'status',
        'isPublished',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * Validate manipulator user
   *
   * @param {<{ identity, password }>} data
   * @returns Promise<Record<string, any>>
   */
  async validateUser({ identity, password }) {
    const entity = await this.manipulatorRepository.firstOrFail({
      conditions: {
        email: identity,
      },
      error: Errors.ACCOUNT_NOT_EXIST,
    });

    if (entity.status !== statuses.ACTIVE) {
      const { code, message, status } = Errors.ACCOUNT_IS_NOT_ACTIVE;
      throw new AppException(code, message, status);
    }

    const isValidPassword = await bcrypt.compare(password, entity.password);
    if (isValidPassword) {
      return { _id: entity._id.toString() };
    }
    const { code, message, status } = Errors.INVALID_PASSWORD;
    throw new AppException(code, message, status);
  }

  /**
   * Get logged user information
   *
   * @param {string} _id The ID of manipulator user
   * @returns {Promise<Document>}
   */
  async getAuthenticationUser(_id: string) {
    const entity = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: _id,
      },
    });
    if (entity.status !== statuses.ACTIVE) {
      const { code, message, status } = Errors.ACCOUNT_IS_NOT_ACTIVE;
      throw new AppException(code, message, status);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = entity.toObject();
    return data as ManipulatorDocument;
  }

  /**
   * Check the user is existed
   *
   * @param {string} identity The identifier of manipulator user
   * @returns {Promise<ManipulatorDocument>}
   */
  async checkUserExisted(identity: string): Promise<ManipulatorDocument> {
    const entity = await this.manipulatorRepository.firstOrFail({
      conditions: {
        email: identity,
      },
      error: Errors.EMAIL_NOT_EXIST,
    });

    return entity;
  }

  async findManipulatorsBySalonId(
    salonId: string,
    paginationParam: PaginateDto,
  ): Promise<ManipulatorsBySalonResponse> {
    const conditions = {
      'salon.salonId': new Types.ObjectId(salonId),
    };
    const data = await this.manipulatorRepository.pagination({
      conditions,
      ...paginationParam,
      select: ['_id', 'name', 'nameKana', 'email', 'profile'],
    });

    const docs = data.docs.map((item) => {
      const manipulator = new ManipulatorsBySalonItemResponse();
      manipulator._id = item._id.toString();
      manipulator.name = item.name;
      manipulator.nameKana = item.nameKana;
      manipulator.email = item.email;
      manipulator.profile = item.profile;
      return manipulator;
    });

    return {
      docs,
      totalDocs: data.totalDocs,
      totalPages: data.totalPages,
      page: data.page,
      limit: data.limit,
    };
  }

  /**
   * Finding the manipulator by condition
   *
   * @param {string} id
   * @returns Promise<ManipulatorDocument>
   */
  async findByConditions(conditions): Promise<ManipulatorDocument[]> {
    return this.manipulatorRepository.find({
      conditions,
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'email',
        'salon',
        'careerStart',
        'nationalLicenses',
        'supportedSymptoms',
        'pr',
        'profile',
        'photos',
        'status',
        'isPublished',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async getManipulatorDetail(id: string): Promise<ManipulatorDocument> {
    const manipulatorEntity = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: id,
        status: statuses.ACTIVE,
      },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'email',
        'salon',
        'careerStart',
        'nationalLicenses',
        'supportedSymptoms',
        'pr',
        'profile',
        'photos',
        'menus',
      ],
    });
    const menus = manipulatorEntity.menus.filter(
      (menu) => menu.status === MenuStatus.Public,
    );
    menus.sort((a, b) => {
      return a.order - b.order;
    });

    manipulatorEntity.menus = menus;
    const salonId = manipulatorEntity.salon[0].salonId.toString();
    const salonInfo = await this.getSalonInfo(salonId);
    manipulatorEntity.salon[0].description = salonInfo?.description;
    return manipulatorEntity;
  }

  /**
   *
   * @param {String} salonId
   * @returns {SalonDocument}
   */
  public async getSalonInfo(salonId: string): Promise<SalonDocument> {
    const salon = await this.salonRepository.findOne({
      conditions: { _id: new Types.ObjectId(salonId) },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'addresses',
        'access',
        'description',
        'features',
        'photos',
        'bankInfo',
        'businessHours',
      ],
    });
    return salon;
  }

  /**
   * Check the email has not yet been used by another manipulator.  for case updates.
   *
   * @param {string} id
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  public async isValidUpdateEmail(id: string, email: string): Promise<boolean> {
    const entity = await this.manipulatorRepository.findOne({
      conditions: {
        email: email,
        _id: { $ne: new Types.ObjectId(id) },
      },
    });
    return !entity;
  }

  /**
   *
   * @param {string} id
   * @param {string} email
   * @returns
   */
  public async salonUpdateEmailOwner(id: string, email: string) {
    const conditions = {
      _id: new Types.ObjectId(id),
    };
    return await this.manipulatorRepository.findOneAndUpdate(conditions, {
      email: email,
    });
  }

  /**
   * Sending email to manipulator for change email confirmation
   *
   * @param {ManipulatorConfirmNewEmailDto} dto
   * @returns {Promise<boolean>}
   */
  async sendNewEmailConfirmation(
    manipulatorId: string,
    dto: ManipulatorConfirmNewEmailDto,
  ): Promise<boolean> {
    const isExisted = await this.manipulatorRepository.findOne({
      conditions: {
        email: dto.email,
      },
    });

    if (isExisted) {
      const { code, message, status } = Errors.EMAIL_EXIST;
      throw new AppException(code, message, status);
    }

    const appUrl = this.configService.get<string>('appConfirmEmailUrl');
    const token = await this._generateToken({
      email: dto.email,
      manipulatorId: manipulatorId,
    });
    const verifyUrl = `${appUrl}?email=${dto.email}&token=${token}`;

    try {
      await this.mailerService.sendNewEmailConfirmation(dto.email, verifyUrl);
    } catch (error) {
      const { code, message, status } = Errors.CANT_SEND_EMAIL;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   * Change the manipulator email
   *
   * @param {ManipulatorChangeEmailDto} dto
   * @returns {Promise<boolean>}
   */
  async changeManipulatorEmail(
    dto: ManipulatorChangeEmailDto,
    manipulatorId: string,
  ): Promise<boolean> {
    const email = await this._verifyChangeEmailToken(manipulatorId, dto.token);
    const isExisted = await this.manipulatorRepository.findOne({
      conditions: {
        email: email,
      },
    });

    if (isExisted) {
      const { code, message, status } = Errors.EMAIL_EXIST;
      throw new AppException(code, message, status);
    }

    try {
      await this.manipulatorRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(manipulatorId) },
        { email },
      );

      return true;
    } catch (error) {
      const { code, message, status } = Errors.CANT_CHANGE_EMAIL;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Verifying the token is valid
   *
   * @param {string} manipulatorId
   * @param {string} token
   * @returns Promise<string>
   */
  private async _verifyChangeEmailToken(
    manipulatorId: string,
    token: string,
  ): Promise<string> {
    try {
      const data = await this.jwtService.verify(token);
      if (data.manipulatorId !== manipulatorId) {
        const { code, message, status } = Errors.INVALID_TOKEN;
        throw new AppException(code, message, status);
      }

      return data.email;
    } catch (error) {
      const { code, message, status } = Errors.INVALID_TOKEN;
      throw new AppException(code, message, status);
    }
  }

  /**
   * Sending the change password email to the new normal manipulator
   *
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  private async _sendVerifyEmailToNewManipulator(
    email: string,
    manipulatorId: string,
  ): Promise<boolean> {
    const appUrl = this.configService.get<string>('appRegisterNormalUrl');
    const token = await this._generateToken({ email, manipulatorId }, '60m');
    const verifyUrl = `${appUrl}?email=${email}&token=${token}`;

    try {
      await this.mailerService.sendRegisterConfirmationForNormal(
        email,
        verifyUrl,
      );
    } catch (error) {
      return false;
    }

    return true;
  }
}
