import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Currency, MenuStatus, MenuType } from '../contracts/type';

export class MenuTicketDto {
  @ApiProperty({ required: true })
  @IsNumber()
  price: number;

  @ApiProperty({ required: true })
  @IsNumber()
  numberOfTicket: number;

  @ApiProperty({ required: false, default: 1 })
  @IsPositive()
  expiryMonth: number;
}

export class CreateMenuDto {
  @ApiProperty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ type: Number })
  @IsPositive()
  order: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  @Max(240)
  estimatedTime: number;

  @ApiProperty()
  @IsMongoId({ each: true })
  @ArrayNotEmpty()
  manipulatorIds: string[];

  @IsBoolean()
  @IsOptional()
  timeDisplay?: boolean;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @ApiProperty({
    enum: Currency,
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ type: MenuTicketDto, required: false })
  @ValidateNested()
  @Type(() => MenuTicketDto)
  ticket?: MenuTicketDto;

  @ApiProperty({
    enum: MenuType,
  })
  @IsEnum(MenuType, { each: true })
  @ArrayNotEmpty()
  menuTypes: MenuType[];

  @ApiProperty({
    enum: MenuStatus,
  })
  @IsEnum(MenuStatus)
  status: MenuStatus;
}
