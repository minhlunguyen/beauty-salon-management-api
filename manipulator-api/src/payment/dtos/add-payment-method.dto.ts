import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethodTypes } from '@src/payment/contracts/type';
import { ApiProperty } from '@nestjs/swagger';

export class AddPaymentMethodDto {
  @ApiProperty({
    enum: PaymentMethodTypes,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodTypes)
  type: string;

  @ApiProperty({
    description:
      'The token is generated from https://api.veritrans.co.jp/4gtoken',
  })
  @IsNotEmpty()
  token: string;
}
