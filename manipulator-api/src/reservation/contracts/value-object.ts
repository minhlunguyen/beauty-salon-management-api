import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethodStatuses,
  PaymentMethodTypes,
} from '@src/payment/contracts/type';
import { Types } from 'mongoose';

export type ReservationType = 'first' | 'repeat';

export class ReservationMenuInfo {
  @ApiProperty({ type: String })
  menuId: Types.ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: Number })
  estimatedTime: number;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty()
  currency: string;
}

export class ReservationInfo {
  @ApiProperty()
  menuId: Types.ObjectId;

  @ApiProperty()
  menuInfo: ReservationMenuInfo;

  @ApiProperty()
  ticketTransactionId?: string;

  @ApiProperty({ isArray: true })
  couponTransactionId?: string[];

  @ApiProperty({ type: String, example: 'first or repeat' })
  reservationType?: ReservationType;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: Number })
  discountAmount: number;

  @ApiProperty({ type: Number })
  totalAmount: number;
}

export class ReservationCustomerInfo {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;
}

export class PaymentInfo {
  cardNumber?: string;
  paymentId?: Types.ObjectId;
  transactionId?: string;
  veritransTransactionId?: string;
  paymentMethod?: string;
  accountId: string;
  amount?: number;
  paymentMethodType: PaymentMethodTypes;
  metaData?: Record<string, string>;
  status: PaymentMethodStatuses;
}

export class CouponInfo {
  transactionId?: number;
  code?: string;
  amount?: number;
}

export class TicketInfo {
  transactionId?: number;
  issuedId?: number;
  code?: string;
  ticketId?: Types.ObjectId;
  ticketUsed?: number;
}
