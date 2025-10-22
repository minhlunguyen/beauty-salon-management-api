import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as _ from 'lodash';

export const handlePagination = (request) => {
  const paginationParams = {
    page: request.query.page,
    limit: request.query.limit,
    sort: request.query.sort,
  };
  paginationParams.page =
    Number(paginationParams.page) > 0 ? Number(paginationParams.page) : 1;
  paginationParams.limit =
    Number(paginationParams.limit) > 0 ? Number(paginationParams.limit) : 10;

  // parse sort field, input: field1.asc_field2_desc
  if (_.isEmpty(paginationParams.sort)) {
    paginationParams.sort = {
      createdAt: -1,
    };
  } else {
    const result = {};
    const sortFields = paginationParams.sort.split('_');
    sortFields.forEach((item) => {
      const sortType = item.indexOf('.asc') !== -1 ? '.asc' : '.desc';
      result[item.replace(sortType, '')] = sortType === '.asc' ? 1 : -1;
    });
    paginationParams.sort = result;
  }
  paginationParams.sort._id = 1;
  return paginationParams;
};

/**
 * decorator get pagination params: page=1&limit=1&sort=field1.asc_field2_desc
 */
export const pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return handlePagination(request);
  },
);
