import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
} from 'class-validator';
import { genders } from '../contracts/type';

export class CustomerRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  nameKana?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('JP')
  phone: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(10)
  birthday?: string;

  @ApiProperty()
  @IsNumber()
  @IsEnum(genders)
  gender: number;

  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
