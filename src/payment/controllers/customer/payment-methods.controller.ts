import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  Put,
  HttpCode,
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AddPaymentMethodDto } from '@src/payment/dtos/add-payment-method.dto';
import { PaymentService } from '@src/payment/services/payment.service';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { Role } from '@src/auth/decorators/role.decorator';
import { GetPaymentMethodDto } from '@src/payment/dtos/get-payment-method.dto';
import { RemovePaymentMethodDto } from '@src/payment/dtos/remove-payment-method.dto';
import { UpdatePaymentMethodDto } from '@src/payment/dtos/update-payment-method.dto';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import {
  AddCardResponse,
  MethodItemsResponse,
} from '@src/payment/contracts/openapi';

@Controller('customer/payment-methods')
@Role('customer')
@UseGuards(JwtAuthGuard)
@ApiTags('Payment (Customer)')
@ApiBearerAuth()
export class PaymentMethodsController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @ApiOkResponse({ type: MethodItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async get(@Request() req, @Query() data: GetPaymentMethodDto) {
    const { veritransAccountId } = req.user;
    return this.paymentService.getPaymentMethods(veritransAccountId, data.type);
  }

  @Post()
  @HttpCode(201)
  @ApiQuery({ name: 'returnList', type: Boolean, required: false })
  @ApiCreatedResponse({ type: AddCardResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async add(
    @Request() req,
    @Body() data: AddPaymentMethodDto,
    @Query('returnList') returnList: boolean,
  ) {
    const { _id, veritransAccountId } = req.user;
    return this.paymentService.addPaymentMethod(
      _id,
      veritransAccountId,
      data,
      returnList,
    );
  }

  @Put('/:id')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async update(
    @Request() req,
    @Param('id') methodId: string,
    @Body() data: UpdatePaymentMethodDto,
  ) {
    const { veritransAccountId } = req.user;
    return this.paymentService.updatePaymentMethod(
      veritransAccountId,
      methodId,
      data,
    );
  }

  @Delete('/:id')
  @ApiOkResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async remove(
    @Request() req,
    @Param('id') methodId: string,
    @Body() data: RemovePaymentMethodDto,
  ): Promise<boolean> {
    const { veritransAccountId } = req.user;
    return this.paymentService.removePaymentMethod(
      veritransAccountId,
      methodId,
      data,
    );
  }
}
