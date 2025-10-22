import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import {
  ApiDataOkResponse,
  ErrorResponse,
} from '@src/common/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';
import {
  GetCouponForReservationOutput,
  GetCustomerCouponOutput,
} from '@src/coupon/contracts/openapi';
import { GetCustomerCouponDto } from '@src/coupon/dtos/get-customer-coupons.dto';
import { CouponService } from '@src/coupon/services/coupon.service';

@Controller('customer/coupons')
@Role('customer')
@UseGuards(JwtAuthGuard)
@ApiTags('Coupon (Customer)')
@ApiBearerAuth()
export class CustomerCouponController {
  constructor(private couponService: CouponService) {}

  @Get()
  @ApiDataOkResponse(GetCustomerCouponOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getAvailableCoupons(
    @Request() req,
    @Query() dto: GetCustomerCouponDto,
    @pagination() paginateDto: PaginateDto,
  ) {
    return this.couponService.getCustomerAvailableCoupons(
      req.user._id.toHexString(),
      paginateDto,
      dto,
    );
  }

  @Get(':salonId/menu/:menuId')
  @ApiDataOkResponse(GetCouponForReservationOutput)
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getCouponsForBooking(
    @Request() req,
    @Param('salonId') salonId: string,
    @Param('menuId') menuId: string,
  ) {
    return this.couponService.getCouponsForReservation(
      req.user._id.toHexString(),
      menuId,
      salonId,
    );
  }
}
