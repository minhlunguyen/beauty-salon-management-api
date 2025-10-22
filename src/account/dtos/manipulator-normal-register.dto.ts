import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { NationalLicense } from '../contracts/type';
import * as moment from 'moment-timezone';
import { PhotoType, WeekDay } from '@src/salon/contracts/value-object';
import { WeekDayUnique } from '@src/account/decorators/rules/week-day-unique.rule';
import { TimeShiftUnique } from '@src/account/decorators/rules/time-shift.rule';

const defaultDate =
  process.env.DEFAULT_DATETIME || '2023-01-02T{HH:MM}:00+09:00';

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

export class PhotoDto {
  @ApiProperty()
  @IsNotEmpty()
  type: PhotoType;

  @ApiProperty()
  @IsNotEmpty()
  objectKey: string;
}

export class SymptomDto {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}

export const NationalLicenses: NationalLicense[] = [
  'Physical Therapist',
  'Occupational Therapist',
  'Massage Therapist',
  'Chiropractor',
];

export class ManipulatorNormalRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  nameKana?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ isArray: true, type: Number })
  @IsArray()
  @Type(() => SymptomDto)
  @Transform(({ value }) => value?.map((ele: number) => ({ id: ele })), {
    toClassOnly: true,
  })
  supportedSymptoms: SymptomDto[];

  @ApiProperty()
  @IsNotEmpty()
  careerStart: string;

  @ApiProperty({ isArray: true, enum: NationalLicenses })
  @IsArray()
  @IsIn(NationalLicenses, { each: true })
  nationalLicenses: NationalLicense[];

  @ApiProperty()
  @IsOptional()
  @MaxLength(500)
  profile?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(500)
  pr?: string;

  @ApiProperty({ isArray: true, type: PhotoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @ApiProperty({ isArray: true, type: BusinessHourDto })
  @ValidateNested()
  @WeekDayUnique()
  @IsNotEmpty()
  @Type(() => BusinessHourDto)
  defaultShifts: BusinessHourDto[];

  @ApiProperty({ type: Boolean })
  @IsOptional()
  verifyEmail?: boolean;
}
