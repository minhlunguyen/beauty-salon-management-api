import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  PhotoType,
  TransferType,
  WeekDay,
} from '@src/salon/contracts/value-object';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  MaxLength,
  ValidateNested,
  IsBoolean,
  IsIn,
  IsString,
  IsDate,
  IsArray,
} from 'class-validator';
import * as moment from 'moment-timezone';
import { WeekDayUnique } from '@src/account/decorators/rules/week-day-unique.rule';
import { TimeShiftUnique } from '@src/account/decorators/rules/time-shift.rule';

const defaultDate =
  process.env.DEFAULT_DATETIME || '2023-01-02T{HH:MM}:00+09:00';

export class AddressDto {
  @ApiProperty()
  @IsNotEmpty()
  prefectureId: number;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  prefectureName: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(250)
  address: string;

  @ApiProperty()
  @IsNumber({}, { each: true })
  stationIds: number[];

  @ApiProperty()
  @IsNotEmpty()
  areaId: number;
}

export class PhotoDto {
  @ApiProperty()
  @IsNotEmpty()
  type: PhotoType;

  @ApiProperty()
  @IsNotEmpty()
  objectKey: string;
}

export class BankInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  bankId: string;

  @ApiHideProperty()
  bankName?: string;

  @ApiProperty()
  @IsNotEmpty()
  branchId: string;

  @ApiHideProperty()
  branchName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn([0, 1])
  transferType: TransferType;

  @ApiProperty()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  accountName: string;
}

export class TimeShiftDto {
  @ApiProperty({ type: String })
  @Transform(
    (obj) => moment(defaultDate.replace('{HH:MM}', obj.value)).toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsDate({ message: 'startTime must be a valid time value (HH:MM)' })
  startTime: Date;

  @ApiProperty({ type: String })
  @Transform(
    (obj) => moment(defaultDate.replace('{HH:MM}', obj.value)).toDate(),
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @IsDate({ message: 'endTime must be a valid time value (HH:MM)' })
  endTime: Date;
}

export class BusinessHourDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  weekDay: WeekDay;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isHoliday: boolean;

  @ApiProperty({ isArray: true, type: TimeShiftDto })
  @ValidateNested()
  @Type(() => TimeShiftDto)
  @TimeShiftUnique()
  hours: TimeShiftDto[];
}

export class FeatureDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;
}

export class RegisterSalonDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  nameKana: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('JP')
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  zipcode: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty({ isArray: true, type: String })
  @IsNotEmpty()
  @IsArray()
  access: string[];

  @ApiProperty({ type: BankInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;

  @ApiProperty({ isArray: true, type: PhotoDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @ApiProperty({ isArray: true, type: AddressDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @ApiProperty({ isArray: true, type: FeatureDto })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @ApiProperty({ isArray: true, type: BusinessHourDto })
  @IsArray()
  @ValidateNested({ each: true })
  @WeekDayUnique()
  @IsNotEmpty()
  @Type(() => BusinessHourDto)
  businessHours: BusinessHourDto[];
}
