import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import { IsTimeAfter } from '@src/reservation/decorators/rules/is-after.rule';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import * as moment from 'moment-timezone';

export class SearchSaleInput {
  @ApiProperty({
    description: 'Usage for searching the salon name or Transaction ID',
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
}

export class SearchSaleItem {
  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  transactionDate: string;

  @ApiProperty()
  salonId: string;

  @ApiProperty()
  salonName: string;

  @ApiProperty()
  manipulatorName: string;

  @ApiProperty()
  menuName?: string;

  @ApiProperty()
  saleAmount: number;
}

export class SearchSaleOutput extends PaginateResultResponse {
  @ApiProperty({ type: SearchSaleItem, isArray: true })
  docs: SearchSaleItem[];

  @ApiProperty()
  totalSaleAmount: number;
}
