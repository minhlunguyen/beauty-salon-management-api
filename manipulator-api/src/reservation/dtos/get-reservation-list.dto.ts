import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';
import {
  ReservationCustomerInfo,
  ReservationInfo,
} from '@src/reservation/contracts/value-object';
import {
  ManipulatorInfoOutput,
  SalonInfoOutput,
} from '@src/reservation/contracts/types';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import { IsTimeAfter } from '../decorators/rules/is-after.rule';
export class GetReservationListDto {
  @ApiProperty({ type: String, example: '2023-02-01' })
  @IsNotEmpty()
  @IsDate({ message: 'date must be a valid value' })
  @Transform(
    (obj) =>
      moment
        .tz(obj.value, process.env.DEFAULT_TIMEZONE || 'Asia/Tokyo')
        .toDate(),
    {
      toClassOnly: true,
    },
  )
  date: Date;
}

export class ReservationItem {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerInfo: ReservationCustomerInfo;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  cancelDeadline: Date;

  @ApiProperty()
  plan: ReservationInfo;

  @ApiProperty()
  result: ReservationInfo;
  @ApiProperty()
  status: string;

  @ApiProperty()
  salonInfo: SalonInfoOutput;

  @ApiProperty()
  manipulatorInfo: ManipulatorInfoOutput;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  couponDiscount?: number;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  ticketUsed?: number;
}

export class ReservationList {
  @ApiProperty({ isArray: true, type: ReservationItem })
  docs: ReservationItem[];

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ReservationListResponse {
  @ApiProperty({ type: ReservationList })
  data: ReservationList;
}

export class OperatorFindReservationItem {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  reservationDate: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  salonName: string;

  @ApiProperty()
  manipulatorName: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  status: string;
}

export class OperatorFindReservationsOutput extends PaginateResultResponse {
  @ApiProperty({ type: OperatorFindReservationItem, isArray: true })
  docs: OperatorFindReservationItem[];
}

export class OperatorGetReservationListInput {
  @ApiProperty({ required: false })
  @IsOptional()
  keyword?: string;

  @ApiProperty({
    type: Date,
    example: '2023-02-21 15:00',
    required: false,
    description: 'The time search from reservation date',
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
    example: '2023-02-21 15:00',
    required: false,
    description: 'The time search to reservation date',
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

  @ApiProperty({ type: String, example: 'RESERVED,DONE', required: false })
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => val.trim()),
    {
      toClassOnly: true,
    },
  )
  status?: string[];
}
