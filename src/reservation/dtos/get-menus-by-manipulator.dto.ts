import { ApiProperty } from '@nestjs/swagger';
import { MenuType, Currency } from '@src/salon/contracts/type';
import { Type } from 'class-transformer';

export class MenuTicketItemResponse {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty({ type: Number })
  numberOfTicket: number;

  @ApiProperty({ type: Number })
  expiryMonth: number;
}
export class GetMenuItemByManipulatorResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  salonId: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  order: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty()
  estimatedTime: number;

  @ApiProperty()
  menuTypes: MenuType[];

  @ApiProperty()
  timeDisplay?: boolean;

  @ApiProperty({
    enum: Currency,
  })
  currency: Currency;

  @ApiProperty({ type: MenuTicketItemResponse, required: false })
  @Type(() => MenuTicketItemResponse)
  ticket?: MenuTicketItemResponse;
}

export class GetMenusByManipulatorOutput {
  @ApiProperty({ isArray: true, type: GetMenuItemByManipulatorResponse })
  docs: GetMenuItemByManipulatorResponse[];
}

export class GetMenusByManipulatorResponse {
  @ApiProperty({ type: GetMenusByManipulatorOutput })
  data: GetMenusByManipulatorOutput;
}
