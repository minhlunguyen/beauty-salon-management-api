import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsPositive } from 'class-validator';
import { SortType } from '../contracts/type';

export class PaginateDto {
  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  @IsPositive()
  @Type(() => Number)
  page = 1;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  @IsPositive()
  @Type(() => Number)
  limit = 10;

  @ApiProperty({ type: String, example: 'field1.asc_field2.desc' })
  @ApiPropertyOptional()
  sort: SortType;
}
