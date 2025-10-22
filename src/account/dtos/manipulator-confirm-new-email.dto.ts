import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ManipulatorConfirmNewEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({ allow_utf8_local_part: false })
  email: string;
}
