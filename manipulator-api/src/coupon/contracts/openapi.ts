import { ApiProperty } from '@nestjs/swagger';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import { ICustomerTicket } from './interfaces';

export class CouponPaginationOuput {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  perPage: number;

  @ApiProperty({ type: Number })
  page: number;

  @ApiProperty({ type: Number })
  lastPage: number;
}

export class MenuItemOuput {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class CouponRuleOutput {
  @ApiProperty({ type: String, isArray: true })
  allowedMenuIds?: string[];

  @ApiProperty({ type: Number })
  min?: number;
}

export class CouponItemOutput {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  currency?: string;

  @ApiProperty({ type: Number })
  amount: number;

  @ApiProperty({ type: MenuItemOuput, isArray: true })
  menus?: MenuItemOuput[];

  @ApiProperty({ type: CouponRuleOutput, isArray: true })
  rules?: CouponRuleOutput[];

  @ApiProperty()
  expiredAt?: Date;

  @ApiProperty({ type: Number })
  quantumIssueUsage?: number;
}

export class TicketItemOuput {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  name?: string;

  @ApiProperty({ type: Number })
  availableCount?: number;

  @ApiProperty()
  expiredAt?: Date;
}

export class GetCustomerCouponOutput extends CouponPaginationOuput {
  @ApiProperty({ type: CouponItemOutput, isArray: true })
  items: CouponItemOutput[] = [];
}

export class GetCouponForReservationOutput {
  @ApiProperty({ type: CouponItemOutput, isArray: true })
  items: CouponItemOutput[] = [];
}

export class GetTicketForReservationOutput {
  @ApiProperty({ type: TicketItemOuput })
  ticket: TicketItemOuput;

  @ApiProperty()
  manipulatorName: string;

  @ApiProperty()
  manipulatorNameKana?: string;

  @ApiProperty()
  salonName: string;

  @ApiProperty()
  salonNameKana?: string;
}

export class GetCustomerTicketItem implements ICustomerTicket {
  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: Date })
  expiredAt: Date;

  @ApiProperty({ type: Number })
  availableCount: number;
}

export class GetCustomerTicketOuput {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerNameKana: string;

  @ApiProperty({ type: GetCustomerTicketItem, isArray: true })
  tickets: GetCustomerTicketItem[];
}

export class GetCustomerTicketBySalonOutput extends PaginateResultResponse {
  @ApiProperty({ type: GetCustomerTicketOuput, isArray: true })
  docs: GetCustomerTicketOuput[];
}
export class TicketManipulatorInfo {
  @ApiProperty()
  manipulatorId: string;

  @ApiProperty()
  manipulatorName: string;

  @ApiProperty()
  manipulatorNameKana: string;
}
export class CustomerTicketItem {
  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: Date })
  expiredAt: Date;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: Number })
  availableCount: number;

  @ApiProperty()
  salonId: string;

  @ApiProperty()
  salonName: string;

  @ApiProperty()
  salonNameKana: string;

  @ApiProperty()
  manipulatorInfo: TicketManipulatorInfo;
}

export class CustomerTicketListOuput extends PaginateResultResponse {
  @ApiProperty({ type: CustomerTicketItem, isArray: true })
  docs: CustomerTicketItem[];
}
