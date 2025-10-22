import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { CouponService } from '@src/coupon/services/coupon.service';

@Controller('manipulator/coupons')
@Role('manipulator')
@UseGuards(JwtAuthGuard)
@ApiTags('Coupon (Manipulator)')
@ApiBearerAuth()
export class ManipulatorCouponController {
  constructor(private couponService: CouponService) {}
}
