import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class StationInfo {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  groupId?: number;
}

export class Address {
  @ApiProperty({ type: Number })
  prefectureId: number;

  @ApiProperty()
  prefectureName: string;

  @ApiProperty({ type: Number })
  areaId: number;

  @ApiProperty()
  city: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: Number, isArray: true })
  stationIds?: number[];

  @ApiProperty({ type: StationInfo, isArray: true })
  stations?: StationInfo[];

  @ApiProperty({ type: Number })
  lineId?: number;
}

export class TimeShift {
  @ApiProperty({ type: Date })
  startTime: Date | string;

  @ApiProperty({ type: Date })
  endTime: Date | string;
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PhotoType = 'avatar' | 'default';

export type TransferType = 0 | 1;

export class BusinessHour {
  @ApiProperty({ type: Number })
  weekDay: WeekDay;

  @ApiProperty({ type: Boolean })
  isHoliday: boolean;

  @ApiProperty({ type: TimeShift, isArray: true })
  hours: TimeShift[];
}

export class Feature {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  name?: string;
}

export class Symptom {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty()
  name?: string;
}

export class Photo {
  @ApiProperty({ type: String, example: 'avatar | default' })
  type: PhotoType;

  @ApiProperty()
  url?: string;

  @ApiProperty()
  objectKey: string;
}

export class BankInfo {
  @ApiProperty()
  bankId: string;

  @ApiProperty()
  bankName?: string;

  @ApiProperty()
  branchId: string;

  @ApiProperty()
  branchName?: string;

  @ApiProperty({ type: Number, example: '0 | 1' })
  transferType: TransferType;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  accountName: string;
}

export type Authority = 'owner' | 'normal';

export class SalonInfo {
  @ApiProperty({ type: String, example: 'owner | normal' })
  authority: Authority;

  @ApiProperty({ type: String })
  salonId: Types.ObjectId;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  nameKana?: string;

  @ApiProperty({ type: Address, isArray: true })
  addresses?: Address[];

  @ApiProperty({ type: BusinessHour, isArray: true })
  businessHours?: BusinessHour[];

  @ApiProperty({ type: String, isArray: true })
  access?: string[];

  @ApiProperty({ type: Feature, isArray: true })
  features?: Feature[];

  @ApiProperty({ type: Photo, isArray: true })
  photos?: Photo[];

  @ApiProperty()
  description?: string;
}

export class MenuTicket {
  @ApiProperty({ type: String })
  id: Types.ObjectId;

  @ApiProperty()
  couponId: number;

  @ApiProperty()
  code: string;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty({ type: Number })
  numberOfTicket: number;

  @ApiProperty({ type: Number })
  expiryMonth: number;
}

export class ReviewRating {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  averageRating: number;
}

export class MenuInfo {
  @ApiProperty({ type: String })
  menuId: Types.ObjectId;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: Number })
  estimatedTime: number;

  @ApiProperty({ type: Number })
  order?: number;

  @ApiProperty({ type: Number })
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  timeDisplay?: boolean;
}
