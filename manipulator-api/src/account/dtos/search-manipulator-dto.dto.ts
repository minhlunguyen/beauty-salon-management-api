import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import * as moment from 'moment-timezone';

export class SearchManipulatorDto {
  @ApiProperty({ type: String, example: 'symptomId1,symptomId2' })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => parseInt(val)),
    {
      toClassOnly: true,
    },
  )
  symptoms?: number[];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ type: String, example: '2023-02-01' })
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
  @ApiPropertyOptional()
  @IsOptional()
  date?: Date;

  @ApiProperty({ type: String, example: '1130101,1130102' })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => parseInt(val)),
    {
      toClassOnly: true,
    },
  )
  stations?: number[];

  @ApiProperty({ type: String, example: '1130101,1130102' })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => parseInt(val)),
    {
      toClassOnly: true,
    },
  )
  stationGroups?: number[];

  @ApiProperty({ type: String, example: 'areaId1,areaId2' })
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(
    ({ value }) => value?.split(',').map((val: string) => parseInt(val)),
    {
      toClassOnly: true,
    },
  )
  areas?: number[];
}
