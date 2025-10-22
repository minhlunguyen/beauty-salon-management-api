import {
  IsNotEmpty,
  IsNumberString,
  Length,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('JP')
  phoneNumber: string;
}
