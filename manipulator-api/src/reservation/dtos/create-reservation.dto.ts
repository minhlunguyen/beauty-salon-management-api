import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  MinDate,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsTimeAfter } from '../decorators/rules/is-after.rule';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';

export class CreateReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  manipulatorId: string;

  @ApiProperty()
  @IsNotEmpty()
  menuId: string;

  @ApiProperty()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ required: false })
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ticketId?: string;

  @ApiProperty({ type: Number, required: false })
  @ValidateIf((obj) => obj.ticketId !== undefined)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  ticketUse?: number;

  @ApiProperty({ type: Date, example: '2023-02-21T15:00:00.000Z' })
  @Transform(({ value }) => moment.utc(value).toDate(), { toClassOnly: true })
  @IsNotEmpty()
  @MinDate(moment.utc().toDate())
  startTime: Date;

  @ApiProperty({ type: Date, example: '2023-02-21T15:30:00.000Z' })
  @Transform(({ value }) => moment.utc(value).toDate(), { toClassOnly: true })
  @IsNotEmpty()
  @IsTimeAfter('startTime')
  endTime: Date;
}
