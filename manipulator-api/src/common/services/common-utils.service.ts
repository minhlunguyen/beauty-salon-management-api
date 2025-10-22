import { Injectable } from '@nestjs/common';
import { PaginateResultResponse } from '../contracts/openapi';

@Injectable()
export class CommonUtilService {
  /**
   * Calculating pagination from skip, limit, totalDocs
   *
   * @param {number} skip
   * @param {number} limit
   * @param {number} totalDocs
   * @returns {PaginateResultResponse}
   */
  calcPaginateData(
    skip: number,
    limit: number,
    totalDocs: number,
  ): PaginateResultResponse {
    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(totalDocs / limit);
    return {
      totalDocs: totalDocs,
      limit,
      offset: skip,
      page,
      totalPages,
      hasPrevPage: page > 1 && totalDocs > 0,
      hasNextPage: page < totalPages && totalDocs > 0,
      prevPage: page - 1 && totalDocs > 0 ? page - 1 : null,
      nextPage: page < totalPages && totalDocs > 0 ? page + 1 : null,
      pagingCounter: totalDocs > 0 ? skip + 1 : null,
    };
  }
}
