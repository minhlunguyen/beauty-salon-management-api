import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('JP')
  phoneNumber: string;
}
