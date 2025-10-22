import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CouponType } from '../contracts/interfaces';

export class GetCustomerCouponDto {
  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;
}
