import {
  AddressDto,
  BankInfoDto,
  BusinessHourDto,
  FeatureDto,
  PhotoDto,
} from './register-salon.dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { WeekDayUnique } from '@src/account/decorators/rules/week-day-unique.rule';
export class OperatorUpdateSalonDto {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(100)
  nameKana: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber('JP')
  phone: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  zipcode: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  description: string;

  @ApiProperty({ isArray: true, type: String })
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  access: string[];

  @ApiProperty({ type: BankInfoDto })
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

  @ApiProperty({ isArray: true, type: PhotoDto })
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @ApiProperty({ isArray: true, type: AddressDto })
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @ApiProperty({ isArray: true, type: FeatureDto })
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @ApiProperty({ isArray: true, type: BusinessHourDto })
  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @WeekDayUnique()
  @IsOptional()
  @Type(() => BusinessHourDto)
  businessHours: BusinessHourDto[];

  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email: string;
}
