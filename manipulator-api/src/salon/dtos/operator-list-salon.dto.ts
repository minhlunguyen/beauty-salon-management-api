import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsTimeAfter } from '@src/reservation/decorators/rules/is-after.rule';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import * as moment from 'moment-timezone';
import { PaginateResultResponse } from '@src/common/contracts/openapi';

export class OperatorGetListSalonDto {
  @ApiProperty({
    description: 'Usage for searching the salon name or ID',
  })
  @ApiPropertyOptional()
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    example: '2023-02-21',
    description: 'The search date for the registration date',
  })
  @ApiPropertyOptional()
  @Transform(
    (obj) =>
      moment
        .tz(obj.value, process.env.DEFAULT_TIMEZONE || 'Asia/Tokyo')
        .startOf('day')
        .toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsOptional()
  from?: Date;

  @ApiProperty({
    example: '2023-02-21',
    description: 'The search date for the registration date',
  })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    (obj) =>
      moment
        .tz(obj.value, process.env.DEFAULT_TIMEZONE || 'Asia/Tokyo')
        .endOf('day')
        .toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsTimeAfter('from')
  to?: Date;

  @ApiProperty({ type: String, example: 'VALID,INVALID,AWAITING_REVIEW' })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    ({ value }) =>
      value?.split(',').map((val: string) => val.trim().toUpperCase()),
    {
      toClassOnly: true,
    },
  )
  status?: string[];
}

export class OperatorGetListSalonItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty()
  status: string;
}

export class OperatorGetListSalonOutput extends PaginateResultResponse {
  @ApiProperty({ type: OperatorGetListSalonItem, isArray: true })
  docs: OperatorGetListSalonItem[];
}
