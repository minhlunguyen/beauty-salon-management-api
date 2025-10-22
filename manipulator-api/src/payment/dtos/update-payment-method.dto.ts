import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumberString,
  IsOptional,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PaymentMethodTypes } from '@src/payment/contracts/type';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDetailDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  defaultCard: boolean;

  @ApiProperty()
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)
  cardExpire: string;

  @ApiProperty()
  @IsOptional()
  @IsNumberString()
  @Length(3, 4)
  securityCode: string;
}

export class UpdatePaymentMethodDto {
  @ApiProperty({
    enum: PaymentMethodTypes,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodTypes)
  type: string;

  @ApiProperty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PaymentMethodDetailDto)
  details: PaymentMethodDetailDto;
}
