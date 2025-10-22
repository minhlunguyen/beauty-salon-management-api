import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from '@src/account/services/customer.services';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { CustomerUpdateDto } from '@src/account/dtos/customer-update.dto';
import { Customer } from '@src/account/schemas/customer.schema';
import { ErrorResponse } from '@src/common/contracts/openapi';

@ApiTags('Customer')
@Controller('customer/profile')
@Role('customer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private customerService: CustomerService) {}

  @Get()
  @ApiOkResponse({ type: Customer })
  async myInfo(@Request() request) {
    return request.user;
  }

  @Patch()
  @ApiOkResponse({ type: Customer })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async update(@Body() updateDto: CustomerUpdateDto, @Request() request) {
    const customerId = request.user._id;
    const result = await this.customerService.update(customerId, updateDto);
    return result;
  }
}
