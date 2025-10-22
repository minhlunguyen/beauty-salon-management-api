import { ApiProperty } from '@nestjs/swagger';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import {
  AvailableBookingSlotsOutput,
  CreateReservationOutput,
  GetReservationItemByCustomerOutput,
} from './types';
import {
  PaymentMethodStatuses,
  PaymentMethodTypes,
} from '@src/payment/contracts/type';

export class AvailableBookingSlotsResponse {
  @ApiProperty({
    type: AvailableBookingSlotsOutput,
  })
  data: AvailableBookingSlotsOutput;
}

export class CreateReservationResponse {
  @ApiProperty({
    type: CreateReservationOutput,
  })
  data: CreateReservationOutput;
}

export class GetReservationsByCustomerOutput extends PaginateResultResponse {
  @ApiProperty({ isArray: true, type: GetReservationItemByCustomerOutput })
  docs: GetReservationItemByCustomerOutput[];
}

export class GetReservationsByCustomerResponse {
  @ApiProperty({ type: GetReservationsByCustomerOutput })
  data: GetReservationsByCustomerOutput;
}

export class OperatorPaymentInfo {
  @ApiProperty()
  cardNumber?: string;

  @ApiProperty()
  transactionId?: string;

  @ApiProperty()
  amount?: number;

  @ApiProperty()
  paymentMethodType: PaymentMethodTypes;

  @ApiProperty()
  status: PaymentMethodStatuses;

  @ApiProperty()
  paymentDate: Date;
}

export class ReservationHistoryOutput {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  reservation: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  updatedAt: string;
}

export class ReservationHistoryResult {
  @ApiProperty({
    type: ReservationHistoryOutput,
    isArray: true,
  })
  result: ReservationHistoryOutput[];
}

export class ReservationHistoryResponse {
  @ApiProperty({
    type: ReservationHistoryResult,
  })
  data: ReservationHistoryOutput;
}
