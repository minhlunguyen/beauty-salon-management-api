import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OperatorFindOperatorDto {
  @ApiProperty({
    required: false,
    description: 'Find operator by email or full name',
  })
  @IsOptional()
  keyword?: string;
}
