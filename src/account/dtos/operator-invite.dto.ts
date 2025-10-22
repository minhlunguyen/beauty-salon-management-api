import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class OperatorInviteDto {
  @ApiProperty()
  @IsEmail({ allow_utf8_local_part: false })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, isArray: true })
  @IsNotEmpty()
  roleIds: string[];
}
