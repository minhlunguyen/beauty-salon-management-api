import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class OperatorFindRoleDto {
  @ApiProperty({
    required: false,
    description: 'Find roles by keyword',
  })
  @IsOptional()
  keyword?: string;
}
