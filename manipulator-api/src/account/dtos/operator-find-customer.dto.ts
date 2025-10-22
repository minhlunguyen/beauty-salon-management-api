import { ApiProperty } from '@nestjs/swagger';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import { IsTimeAfter } from '@src/reservation/decorators/rules/is-after.rule';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import * as moment from 'moment-timezone';
import { statuses } from '../schemas/customer.schema';

export class OperatorFindCustomersInput {
  @ApiProperty({
    required: false,
    description: 'Find customer by id, name, name kana',
  })
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    type: Date,
    example: '2023-02-21',
    required: false,
    description: 'The time search from register date',
  })
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
    type: Date,
    example: '2023-02-21',
    required: false,
    description: 'The time search to register date',
  })
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
  @IsOptional()
  @IsTimeAfter('from')
  to?: Date;

  @ApiProperty({
    type: String,
    example: Object.values(statuses).join(','),
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => val.trim()),
    {
      toClassOnly: true,
    },
  )
  status?: string[];
}

export class OperatorFindCustomerItem {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;
}

export class OperatorFindCustomersOutput extends PaginateResultResponse {
  @ApiProperty({ type: OperatorFindCustomerItem, isArray: true })
  docs: OperatorFindCustomerItem[];
}
