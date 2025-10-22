import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethodTypes } from '@src/payment/contracts/type';
import { ApiProperty } from '@nestjs/swagger';

export class GetPaymentMethodDto {
  @ApiProperty({
    enum: PaymentMethodTypes,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodTypes)
  type: string;
}
