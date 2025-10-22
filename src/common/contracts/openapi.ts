import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

class ErrorData {
  @ApiProperty()
  statusCode: string;

  @ApiProperty()
  message: string[];

  @ApiProperty()
  error: string;
}

class BaseErrorResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  code: string;
}

class ResultErrorResponse {
  @ApiProperty({ type: ErrorData })
  result: ErrorData;
}

export class ErrorResponse {
  @ApiProperty({ type: BaseErrorResponse })
  error: BaseErrorResponse;

  @ApiProperty({ type: ResultErrorResponse })
  data: ResultErrorResponse;
}

export class SuccessResponse {
  @ApiProperty()
  data: boolean;
}

export class PaginateResultResponse {
  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasPrevPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  page?: number | undefined;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  prevPage?: number | null | undefined;
  nextPage?: number | null | undefined;

  @ApiProperty()
  pagingCounter: number;

  @ApiProperty()
  meta?: any;
}

export class DataResponseOk<T> {
  data: T;
}

export const ApiDataOkResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(DataResponseOk, dataDto),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: { $ref: getSchemaPath(dataDto) },
        },
      },
    }),
  );
