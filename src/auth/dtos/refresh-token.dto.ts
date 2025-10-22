import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshToken {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
