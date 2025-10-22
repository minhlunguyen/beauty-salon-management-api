import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment-timezone';
import { TimeShiftUnique } from '@src/account/decorators/rules/time-shift.rule';

export class TimeRangeDto {
  @ApiProperty({ type: String })
  @Transform(
    (obj) =>
      moment
        .tz(obj.value, 'HH:mm', process.env.DEFAULT_TIMEZONE || 'Asia/Tokyo')
        .toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsDate({ message: 'startTime must be a valid time value (HH:MM)' })
  startTime: Date;

  @ApiProperty({ type: String })
  @Transform(
    (obj) =>
      moment
        .tz(obj.value, 'HH:mm', process.env.DEFAULT_TIMEZONE || 'Asia/Tokyo')
        .toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsDate({ message: 'endTime must be a valid time value (HH:MM)' })
  endTime: Date;
}

export class UpdateManipulatorDailyScheduleDto {
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

  @ApiProperty({ isArray: true, type: TimeRangeDto })
  @Type(() => TimeRangeDto)
  @TimeShiftUnique()
  workingTime: TimeRangeDto[];

  @ApiProperty({ type: Boolean })
  @IsNotEmpty()
  isDayOff: boolean;
}
