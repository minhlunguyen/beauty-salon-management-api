import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ManipulatorChangeEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string;
}
