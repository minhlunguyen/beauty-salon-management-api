import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment-timezone';

export class GetSchedulesDto {
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
