import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CustomerBuyTicketDto {
  @ApiProperty()
  @IsNotEmpty()
  paymentMethod: string;
}
