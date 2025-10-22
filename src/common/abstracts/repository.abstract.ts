import {
  AggregateOptions,
  Callback,
  ClientSession,
  Document,
  PaginateModel,
  PipelineStage,
  QueryOptions,
  SaveOptions,
} from 'mongoose';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '@src/common/contracts/error';
import { PopulateOptions } from 'mongoose';

export default class AbstractRepository<T extends Document> {
  public model: PaginateModel<T>;
  constructor(model: PaginateModel<T>) {
    this.model = model;
  }

  /**
   * Get a document include select and populate, throw error if there is no item
   * @param param0
   */
  public async firstOrFail({
    conditions,
    selectedFields,
    options,
    populates,
    error,
  }: {
    conditions: any;
    selectedFields?: Record<string, any> | string;
    populates?: Array<PopulateOptions>;
    options?: QueryOptions | undefined;
    error?: { code: string; status: number; message: string };
  }): Promise<T> {
    const entity = await this.findOne({
      conditions,
      selectedFields,
      populates,
      options,
    });
    if (entity) {
      return entity;
    }
    if (!error) {
      error = Errors.OBJECT_NOT_FOUND;
    }
    const { code, status, message } = error;
    throw new AppException(code, message, status);
  }

  /**
   * Get a document include select and populate
   * @param param0
   */
  public async findOne({
    conditions = {},
    selectedFields,
    populates,
    options,
  }: {
    conditions: any;
    selectedFields?: Record<string, any> | string;
    populates?: Array<PopulateOptions>;
    options?: QueryOptions | undefined;
  }): Promise<T | undefined> {
    const query = this.model.findOne(conditions, selectedFields, options);
    if (populates && populates.length) {
      populates.forEach((item) => {
        query.populate(item);
      });
    }
    return query.exec();
  }

  /**
   * Get documents based on pagination
   * @param param0
   */
  public async pagination({
    conditions = {},
    select,
    sort,
    page = 1,
    limit = 20,
    populate,
    options,
  }: Record<string, any> = {}) {
    const result = await this.model.paginate(conditions, {
      select,
      sort,
      page,
      limit,
      populate,
      options,
    });
    return result;
  }

  /**
   * Get documents include select, populate and sort
   * @param param0
   */
  public find(
    {
      conditions,
      selectedFields,
      populates,
      sort,
      options,
    }: {
      conditions: any;
      selectedFields?: Record<string, any> | undefined;
      populates?: Array<PopulateOptions>;
      sort?: Record<string, any> | undefined;
      options?: QueryOptions | undefined;
    } = { conditions: {} },
  ) {
    const query = this.model.find(conditions, selectedFields, options);
    if (populates && populates.length) {
      populates.forEach((item) => {
        query.populate(item);
      });
    }
    if (sort) {
      query.sort(sort);
    }
    return query.exec();
  }

  /**
   * create a entity
   * @param attributes
   */
  public async create(
    attributes: Record<string, any>,
    options?: SaveOptions | undefined,
  ) {
    const entity = new this.model(attributes);
    await entity.save(options);
    return entity;
  }

  /**
   * create a entity
   * @param attributes
   */
  public async insertMany(docs: T[], options?: SaveOptions | undefined) {
    return this.model.insertMany(docs, options);
  }

  /**
   *
   */
  public async count(conditions: any = {}) {
    return this.model.count(conditions);
  }

  /**
   *
   */
  public async findOneAndUpdate(
    conditions,
    updatedData,
    options?: QueryOptions | undefined,
  ) {
    return this.model.findOneAndUpdate(conditions, updatedData, options);
  }

  /**
   * Update many
   */
  public async updateMany(
    conditions,
    updatedData,
    options?: QueryOptions | undefined,
  ) {
    return this.model.updateMany(conditions, updatedData, options);
  }

  /**
   *
   * Start session
   *
   * @returns
   */
  public async startSession(): Promise<ClientSession> {
    return this.model.startSession();
  }

  /**
   * aggregate
   * @param {PipelineStage} pipeline
   * @param {AggregateOptions} options
   * @param {Callback<T[]>} callback
   * @returns
   */
  public aggregate<T>(
    pipeline: PipelineStage[],
    options?: AggregateOptions,
    callback?: Callback<T[]>,
  ) {
    return this.model.aggregate<T>(pipeline, options, callback);
  }
}
