import { IsNotEmpty, Min, MinDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsTimeAfter } from '../decorators/rules/is-after.rule';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';

export class CreateNextReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  menuId: string;

  @ApiProperty()
  @IsNotEmpty()
  @Min(0)
  amount: number;

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
