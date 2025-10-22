import { ApiProperty } from '@nestjs/swagger';
import { ReservationCustomerInfo } from '@src/reservation/contracts/value-object';
import {
  OperatorManipulatorInfoOutput,
  OperatorSalonInfoOutput,
} from '@src/reservation/contracts/types';

import { OperatorPaymentInfo } from '@src/reservation/contracts/openapi';

export class OperatorReservationDetail {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerInfo: ReservationCustomerInfo;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  cancelDeadline: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  salonInfo: OperatorSalonInfoOutput;

  @ApiProperty()
  manipulatorInfo: OperatorManipulatorInfoOutput;

  @ApiProperty()
  paymentInfo: OperatorPaymentInfo;

  @ApiProperty()
  totalAmount?: number;

  @ApiProperty()
  discountAmount?: number;

  @ApiProperty({ required: false })
  ticketUse?: number;

  @ApiProperty({ required: false })
  couponDiscount?: number;

  @ApiProperty()
  menuName: string;

  @ApiProperty()
  estimatedTime: number;
}

export class OperatorReservationDetailResponse {
  @ApiProperty({ type: OperatorReservationDetail })
  data: OperatorReservationDetail;
}
