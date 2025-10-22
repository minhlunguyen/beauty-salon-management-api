import { Injectable } from '@nestjs/common';
import { Errors } from '@src/salon/contracts/error';
import { Errors as CommonErrors } from '@src/common/contracts/error';
import { AppException } from '@src/common/exceptions/app.exception';
import { S3Service } from '@src/media/services/s3.service';
import { FilterQuery, QueryOptions, Types, UpdateQuery } from 'mongoose';
import {
  Address,
  BankInfo,
  Feature,
  Photo,
  SalonInfo,
  StationInfo,
} from '../contracts/value-object';
import { FeatureRepository } from '../repositories/feature.repository';
import { AreaRepository } from '../repositories/area.repository';
import { SalonRepository } from '../repositories/salon.repository';
import { StationRepository } from '../repositories/station.repository';
import { Salon, SalonDocument } from '../schemas/salon.schema';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { FileRepository } from '@src/media/repositories/file.repository';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import { ManipulatorDocument } from '@src/account/schemas/manipulator.schema';
import { CommonUtilService } from '@src/common/services/common-utils.service';
import {
  OperatorGetListSalonItem,
  OperatorGetListSalonOutput,
} from '../dtos/operator-list-salon.dto';
import { BankRepository } from '../repositories/bank.repository';
import { BankBranchRepository } from '../repositories/bank-branch.repository';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { TokenRepository } from '@src/auth/repositories/token.repository';
import { GetSalonByOperatorOutput } from '../dtos/get-salon-by-operator.dto';
import { OperatorUpdateSalonDto } from '@src/salon/dtos/operator-update-salon.dto';
import * as _ from 'lodash';
import { SalonScheduleService } from '@src/schedule/services/salon-schedule.service';

@Injectable()
export class SalonService {
  constructor(
    private salonRepository: SalonRepository,
    private featureRepository: FeatureRepository,
    private areaRepository: AreaRepository,
    private stationRepository: StationRepository,
    private manipulatorService: ManipulatorService,
    private s3Service: S3Service,
    private salonScheduleService: SalonScheduleService,
    private fileRepository: FileRepository,
    private commonUtilsService: CommonUtilService,
    private bankRepository: BankRepository,
    private bankBranchRepository: BankBranchRepository,
    private dateUtilService: DateUtilService,
    private tokenRepository: TokenRepository,
  ) {}

  /**
   * Creating new salon
   *
   * @param {Salon} data
   * @returns
   */
  async create(data: Salon, manipulatorId: string): Promise<boolean> {
    // Re-populate data of features
    if (data.features) {
      data.features = await this._populateFeatures(data.features);
    }

    // Re-populate data of addresses
    if (data.addresses) {
      data.addresses = await this._populateAddress(data.addresses);
    }

    // Re-populate data of photo
    if (data.photos) {
      data.photos = this._populatePhotoUrl(data.photos);
    }

    // Re-populate data of bankInfo
    if (data.bankInfo) {
      data.bankInfo = await this._populateBankInfo(data.bankInfo);
    }

    try {
      const session = await this.stationRepository.startSession();
      await session.withTransaction(async (session) => {
        // Dont publish for the new salon
        data.isPublished = false;

        if (data.photos) {
          await this.fileRepository.updateFileStatus(
            data.photos.map((file) => file.objectKey),
            undefined,
            { session },
          );
        }

        const salonEntity = await this.salonRepository.create(
          { ...data, owner: new Types.ObjectId(manipulatorId) },
          {
            session,
          },
        );

        const salon: SalonInfo = {
          salonId: new Types.ObjectId(salonEntity._id),
          authority: 'owner',
          name: salonEntity.name,
          nameKana: salonEntity.nameKana,
          addresses: salonEntity.addresses,
          businessHours: salonEntity.businessHours,
          access: salonEntity.access || [],
          features: salonEntity.features || [],
          photos: salonEntity.photos || [],
        };

        await this.manipulatorService.findOneAndUpdate(
          { _id: new Types.ObjectId(manipulatorId) },
          {
            $push: { salon: salon },
            name: salonEntity.name,
            nameKana: salonEntity.nameKana,
            isNewRegistration: false,
            defaultShifts: salonEntity.businessHours,
          },
          { session },
        );

        // generating salon schedules from the current date to the end of next month
        await this.salonScheduleService.generateSalonSchedulesInMonths(
          salonEntity._id.toHexString(),
          salonEntity.businessHours || [],
          1,
          { session },
        );
      });
      session.endSession();
    } catch (error) {
      const { code, message, status } = Errors.CAN_NOT_REGISTER_SALON;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   * Update a specified salon
   *
   * @param {string} salonId
   * @param {Partial<Salon>} data
   * @returns Promise<boolean>
   */
  async update(salonId: string, data: Partial<Salon>): Promise<boolean> {
    const salon = await this.salonRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(salonId) },
      error: Errors.SALON_NOT_FOUND,
    });

    // Re-populate data of features
    if (data.features) {
      data.features = await this._populateFeatures(data.features);
    }

    // Re-populate data of addresses
    if (data.addresses) {
      data.addresses = await this._populateAddress(data.addresses);
    }

    // Re-populate data of photo
    if (data.photos) {
      data.photos = this._populatePhotoUrl(data.photos);
    }

    // Re-populate data of bankInfo
    if (data.bankInfo) {
      data.bankInfo = await this._populateBankInfo(data.bankInfo);
    }

    try {
      const session = await this.stationRepository.startSession();
      await session.withTransaction(async (session) => {
        if (data.photos) {
          await this.fileRepository.updateFileStatus(
            data.photos.map((file) => file.objectKey),
            salon.photos?.map((file) => file.objectKey),
            { session },
          );
        }

        const salonEntity = await this.salonRepository.findOneAndUpdate(
          { _id: new Types.ObjectId(salonId) },
          data,
          { session, new: true },
        );

        await this.manipulatorService.updateMany(
          {
            'salon.salonId': new Types.ObjectId(salonId),
          },
          {
            $set: {
              'salon.$.name': salonEntity.name,
              'salon.$.nameKana': salonEntity.nameKana,
              'salon.$.addresses': salonEntity.addresses,
              'salon.$.businessHours': salonEntity.businessHours,
              'salon.$.access': salonEntity.access || [],
              'salon.$.features': salonEntity.features || [],
              'salon.$.photos': salonEntity.photos || [],
            },
          },
          { session },
        );
      });
      session.endSession();
    } catch (error) {
      const { code, message, status } = Errors.CAN_NOT_UPDATE_SALON;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   * Get salon list
   */
  getSalonList() {
    return this.salonRepository.find({
      conditions: {},
    });
  }

  /**
   * get salon info by id
   *
   * @param id
   * @returns
   */
  async getSalonById(id: string): Promise<Salon & { email?: string }> {
    const result = await this.salonRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(id) },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'addresses',
        'access',
        'phone',
        'zipcode',
        'description',
        'features',
        'photos',
        'bankInfo',
        'businessHours',
      ],
      populates: [{ path: 'owner', select: 'email' }],
    });

    result.businessHours = this.dateUtilService.parseWorkingTimeToLocalTime(
      result.businessHours,
    );

    if (result.addresses.length > 0) {
      result.addresses = await this._populateLineInfo(result.addresses);
    }

    const { owner, ...salon } = result.toObject();
    return { ...salon, email: (owner as ManipulatorDocument).email };
  }

  /**
   * Find one and update the salon
   *
   * @param {FilterQuery<SalonDocument>} conditions
   * @param {UpdateQuery<SalonDocument>} data
   * @param {QueryOptions | undefined} options
   * @returns
   */
  async findOneAndUpdate(
    conditions: FilterQuery<SalonDocument>,
    data: UpdateQuery<SalonDocument>,
    options: QueryOptions | undefined,
  ): Promise<SalonDocument> {
    return await this.salonRepository.findOneAndUpdate(
      conditions,
      data,
      options,
    );
  }

  /**
   * Finding salons from the operator side
   *
   * @param {IFilter} filters
   * @param {PaginateDto} paginate
   * @returns {Promise<OperatorGetListSalonOutput>}
   */
  async findSalonForOperator<
    IFilter extends {
      keyword?: string;
      from?: Date;
      to?: Date;
      status?: string[];
    },
  >(
    filters: IFilter,
    paginate: PaginateDto,
  ): Promise<OperatorGetListSalonOutput> {
    const result = await this.salonRepository.search({
      ...filters,
      skip: (paginate.page - 1) * paginate.limit,
      limit: paginate.limit,
      sort: paginate.sort,
    });

    const resp = new OperatorGetListSalonOutput();
    resp.docs = result.docs.map((salon) => {
      return {
        id: salon._id,
        name: salon.name,
        nameKana: salon.nameKana,
        email: (salon.owner as ManipulatorDocument)?.email || '',
        phone: salon.phone,
        createdAt: (salon as any).createdAt,
        status: salon.status,
      } as OperatorGetListSalonItem;
    });

    const paginateData = this.commonUtilsService.calcPaginateData(
      result.skip,
      result.limit,
      result.totalDocs,
    );

    return { ...resp, ...paginateData };
  }
  /*
   * Operator get salon info by salon Id
   * @param id
   * @returns GetSalonByOperatorOutput
   */
  async getSalonByIdForOperator(id: string): Promise<GetSalonByOperatorOutput> {
    const salonData = await this.salonRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(id) },
      selectedFields: [
        '_id',
        'name',
        'nameKana',
        'addresses',
        'access',
        'phone',
        'zipcode',
        'status',
        'description',
        'features',
        'photos',
        'bankInfo',
        'businessHours',
      ],
      error: Errors.SALON_NOT_FOUND,
    });

    const manipulators = await this.manipulatorService.findByConditions({
      'salon.salonId': new Types.ObjectId(id),
      'salon.authority': 'owner',
    });
    if (!manipulators) {
      const { code, message, status } = Errors.SALON_HAS_NO_OWNER;
      throw new AppException(code, message, status);
    }
    const manipulator = manipulators[0] as ManipulatorDocument;

    const latestToken = await this.tokenRepository.findOne({
      conditions: {
        userId: manipulator.id,
        role: 'manipulator',
      },
      options: {
        sort: { createdAt: -1 },
      },
    });

    const result = new GetSalonByOperatorOutput();
    result._id = salonData.id;
    result.name = salonData.name;
    result.nameKana = salonData.nameKana;
    result.status = salonData.status;
    result.lastLogin = _.get(latestToken, 'createdAt');
    result.email = manipulator.email;
    result.phone = salonData.phone;
    result.description = salonData.description;
    result.postalCode = salonData.zipcode;
    result.addresses = salonData.addresses;
    result.access = salonData.access;
    result.features = salonData.features;
    result.pr = manipulator.pr;
    result.photos = salonData.photos;
    result.bankInfo = salonData.bankInfo;

    result.businessHours = this.dateUtilService.parseWorkingTimeToLocalTime(
      salonData.businessHours,
    );
    result.features = salonData.features;

    return result;
  }

  /**
   * Populating master data for features
   *
   * @param {Feature[]} data
   * @param {QueryOptions| undefined} options
   * @returns
   */
  private async _populateFeatures(
    data: Feature[],
    options?: QueryOptions | undefined,
  ) {
    const ids = data.map((feature) => feature.id);
    const features = await this.featureRepository.find({
      conditions: { _id: ids },
      options: options,
    });

    if (features.length) {
      data = features.map((feature) => ({
        id: feature.id,
        name: feature.name,
      }));
    } else {
      data = [];
    }

    return data;
  }

  /**
   * Populating master data for features
   *
   * @param {Address[]} data
   * @param {QueryOptions| undefined} options
   * @returns
   */
  private async _populateAddress(
    data: Address[],
    options?: QueryOptions | undefined,
  ) {
    const ids = data.map((address) => address.prefectureId);
    const provinces = await this.areaRepository.find({
      conditions: { provinceId: ids },
      options: options,
    });
    let stationIds = [];
    data.forEach((item) => {
      if (item.stationIds) {
        stationIds = stationIds.concat(item.stationIds || []);
      }
    });

    const stationData = await this.stationRepository.find({
      conditions: { _id: { $in: stationIds } },
    });
    const addressData = [];
    for (const [i, address] of data.entries()) {
      const provinceDoc = provinces.find(
        (province) => address.prefectureId === province.provinceId,
      );
      if (provinceDoc) {
        address.prefectureName = provinceDoc.provinceName;
      }

      const stations: StationInfo[] = [];
      address.stationIds.forEach((stationId) => {
        const stationDoc = stationData.find((item) => item._id === stationId);
        if (stationDoc) {
          stations.push({
            id: stationDoc._id,
            name: stationDoc.name,
            groupId: stationDoc.groupId,
          });
        }
      });
      if (stations.length !== address.stationIds.length) {
        const { code, message, status } = CommonErrors.STATION_NOT_EXIST;
        throw new AppException(code, message, status);
      }

      address.stationIds = stations.map((item) => item.id);
      address.stations = stations;
      addressData[i] = address;
    }
    return addressData;
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
   * Populating master data for bank information
   *
   * @param {BankInfo} data
   * @returns {Promise<BankInfo>}
   */
  private async _populateBankInfo(data: BankInfo): Promise<BankInfo> {
    const bankObj = await this.bankRepository.firstOrFail({
      conditions: { _id: data.bankId },
      selectedFields: ['_id', 'bankName'],
      error: Errors.BANK_NOT_FOUND,
    });

    const branchObj = await this.bankBranchRepository.firstOrFail({
      conditions: { _id: data.branchId, bankRef: data.bankId },
      selectedFields: ['_id', 'branchName'],
      error: Errors.BANK_BRANCH_NOT_FOUND,
    });

    data.bankName = bankObj.bankName;
    data.branchName = branchObj.branchName;

    return data;
  }

  /**
   * Operator Update a specified salon
   *
   * @param {string} salonId
   * @param {Partial<Salon>} data
   * @returns Promise<boolean>
   */
  async operatorUpdate(
    salonId: string,
    data: Partial<OperatorUpdateSalonDto>,
  ): Promise<boolean> {
    const salon = await this.salonRepository.firstOrFail({
      conditions: { _id: new Types.ObjectId(salonId) },
      error: Errors.SALON_NOT_FOUND,
    });

    //validate email
    if (data.email) {
      const manipulatorId = salon.owner.toString();
      const manipulatorOwner = await this.manipulatorService.findById(
        manipulatorId,
      );
      if (data.email !== manipulatorOwner.email) {
        const isValidUpdateEmail =
          await this.manipulatorService.isValidUpdateEmail(
            manipulatorId,
            data.email,
          );
        if (isValidUpdateEmail) {
          await this.manipulatorService.salonUpdateEmailOwner(
            manipulatorId,
            data.email,
          );
        }
      }
    }

    // Re-populate data of features
    if (data.features) {
      data.features = await this._populateFeatures(data.features);
    }

    // Re-populate data of addresses
    if (data.addresses) {
      data.addresses = await this._populateAddress(data.addresses);
    }

    // Re-populate data of photo
    if (data.photos) {
      data.photos = this._populatePhotoUrl(data.photos);
    }

    // Re-populate data of bankInfo
    if (data.bankInfo) {
      data.bankInfo = await this._populateBankInfo(data.bankInfo);
    }

    try {
      const session = await this.stationRepository.startSession();
      await session.withTransaction(async (session) => {
        if (data.photos) {
          await this.fileRepository.updateFileStatus(
            data.photos.map((file) => file.objectKey),
            salon.photos?.map((file) => file.objectKey),
            { session },
          );
        }

        const salonEntity = await this.salonRepository.findOneAndUpdate(
          { _id: new Types.ObjectId(salonId) },
          data,
          { session, new: true },
        );

        await this.manipulatorService.updateMany(
          {
            'salon.salonId': new Types.ObjectId(salonId),
          },
          {
            $set: {
              'salon.$.name': salonEntity.name,
              'salon.$.nameKana': salonEntity.nameKana,
              'salon.$.addresses': salonEntity.addresses,
              'salon.$.businessHours': salonEntity.businessHours,
              'salon.$.access': salonEntity.access || [],
              'salon.$.features': salonEntity.features || [],
              'salon.$.photos': salonEntity.photos || [],
            },
          },
          { session },
        );
      });
      session.endSession();
    } catch (error) {
      const { code, message, status } = Errors.CAN_NOT_UPDATE_SALON;
      throw new AppException(code, message, status);
    }

    return true;
  }

  /**
   * Populating master data for line information
   *
   * @param {BankInfo} data
   * @returns {Promise<Address[]>}
   */
  private async _populateLineInfo(data: Address[]): Promise<Address[]> {
    const result: Address[] = [];
    for (const address of data) {
      const stationId = address.stationIds[0] || null;
      if (stationId) {
        const station = await this.stationRepository.findOne({
          conditions: {
            _id: stationId,
          },
        });

        address.lineId = station?.lineId;
        result.push(address);
      }
    }
    return result;
  }
}
