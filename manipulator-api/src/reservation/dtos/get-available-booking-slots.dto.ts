import { IsNotEmpty, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAvailableBookingSlotsDto {
  @ApiProperty({ type: Date, example: '2023-02-21T15:00:00.000Z' })
  @IsNotEmpty()
  @IsISO8601()
  startTime: Date;

  @ApiProperty({ type: Date, example: '2023-02-27T15:00:00.000Z' })
  @IsNotEmpty()
  @IsISO8601()
  endTime: Date;
}
