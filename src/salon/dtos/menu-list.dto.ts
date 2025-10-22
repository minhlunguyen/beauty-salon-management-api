import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Currency, MenuStatus, MenuType } from '../contracts/type';
import { MenuTicketDto } from '../dtos/create-menu.dto';
export class FilterMenuListDto {
  @IsOptional()
  @ApiProperty({
    enum: MenuStatus,
  })
  @IsEnum(MenuStatus)
  status: MenuStatus;
}
export class MenuItemResponse {
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

  @ApiProperty()
  price: number;

  @ApiProperty()
  estimatedTime: number;

  @ApiProperty()
  manipulatorIds: string[];

  @ApiProperty()
  menuTypes: MenuType[];

  @ApiProperty()
  timeDisplay?: boolean;

  @ApiProperty({
    enum: Currency,
  })
  currency: Currency;

  @ApiProperty({ type: MenuTicketDto })
  @Type(() => MenuTicketDto)
  ticket: MenuTicketDto;

  @ApiProperty({
    enum: MenuStatus,
  })
  status: MenuStatus;
}

export class MenuListResponse {
  @ApiProperty({ isArray: true, type: MenuItemResponse })
  docs: MenuItemResponse[];

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class MenuListDataResponse {
  @ApiProperty({ type: MenuListResponse })
  data: MenuListResponse;
}

export class MenuDetailRepsonse {
  @ApiProperty({ type: MenuItemResponse })
  data: MenuItemResponse;
}
