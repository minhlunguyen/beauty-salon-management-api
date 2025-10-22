import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('JP')
  phoneNumber: string;
}
