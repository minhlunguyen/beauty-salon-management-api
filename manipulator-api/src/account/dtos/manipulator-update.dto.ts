import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  BusinessHourDto,
  NationalLicenses,
  PhotoDto,
  SymptomDto,
} from './manipulator-normal-register.dto';
import { Transform, Type } from 'class-transformer';
import { NationalLicense } from '../contracts/type';
import { WeekDayUnique } from '../decorators/rules/week-day-unique.rule';

export class ManipulatorUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(100)
  nameKana?: string;

  @ApiProperty({ isArray: true, type: Number, required: false })
  @IsArray()
  @IsOptional()
  @Type(() => SymptomDto)
  @Transform(({ value }) => value?.map((ele: number) => ({ id: ele })), {
    toClassOnly: true,
  })
  supportedSymptoms?: SymptomDto[];

  @ApiProperty()
  @IsOptional()
  careerStart?: string;

  @ApiProperty({ isArray: true, enum: NationalLicenses, required: false })
  @IsArray()
  @IsOptional()
  @IsIn(NationalLicenses, { each: true })
  nationalLicenses?: NationalLicense[];

  @ApiProperty()
  @IsOptional()
  @MaxLength(500)
  profile?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(500)
  pr?: string;

  @ApiProperty({ isArray: true, type: PhotoDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @ApiProperty({ isArray: true, type: BusinessHourDto, required: false })
  @ValidateNested()
  @WeekDayUnique()
  @IsOptional()
  @Type(() => BusinessHourDto)
  defaultShifts?: BusinessHourDto[];
}
