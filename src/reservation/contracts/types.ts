import { Prop } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  MenuInfo,
  Photo,
  ReviewRating,
  SalonInfo,
} from '@src/salon/contracts/value-object';
import { ReservationInfo } from './value-object';
import { ManipulatorDocument } from '@src/account/schemas/manipulator.schema';
import { SalonDocument } from '@src/salon/schemas/salon.schema';

export enum ReservationStatus {
  RESERVED = 'RESERVED',
  FREE_CANCELED = 'FREE_CANCELED',
  PAID_CANCELED = 'PAID_CANCELED',
  DONE = 'DONE',
}
export class AvailableBookingSlotsManipulatorOutput {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty({
    isArray: true,
    type: PickType(SalonInfo, [
      'name',
      'nameKana',
      'access',
      'photos',
    ] as const),
  })
  salon: Pick<SalonInfo, 'name' | 'nameKana' | 'access' | 'photos'>[];

  @ApiProperty()
  pr: string;

  @ApiProperty({ isArray: true, type: Photo })
  photos: Photo[];

  @ApiProperty()
  reviewRating: ReviewRating;

  @ApiProperty({ isArray: true, type: MenuInfo })
  menus: MenuInfo[];
}

export class AvailableBookingSlotsOutput {
  @ApiProperty({
    isArray: true,
    type: Date,
    example: ['2023-02-06T02:00:00.000Z', '2023-02-06T02:30:00.000Z'],
  })
  availableSlots: Date[];

  @ApiProperty({
    type: AvailableBookingSlotsManipulatorOutput,
  })
  manipulator: AvailableBookingSlotsManipulatorOutput;
}

export class CreateReservationOutput {
  @ApiProperty()
  reservationId: string;
}

export class ManipulatorInfoOutput {
  @ApiProperty({ type: String })
  manipulatorId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  pr: string;

  @ApiProperty()
  profile: string;

  @ApiProperty({ isArray: true, type: Photo })
  photos?: Photo[];
}

export class SalonInfoOutput {
  @ApiProperty({ type: String })
  salonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ isArray: true, type: Photo })
  photos?: Photo[];
}

export class GetReservationItemByCustomerOutput {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  salonInfo: SalonInfoOutput;

  @ApiProperty()
  manipulatorInfo: ManipulatorInfoOutput;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  @Prop({
    required: true,
  })
  endTime: Date;

  @ApiProperty()
  @Prop({
    required: true,
  })
  cancelDeadline: Date;

  @ApiProperty()
  @Prop({
    type: ReservationInfo,
  })
  plan: ReservationInfo;

  @ApiProperty()
  @Prop({
    type: ReservationInfo,
  })
  result: ReservationInfo;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  couponDiscount?: number;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  ticketUsed?: number;

  @ApiProperty()
  status: string;
}

export class OperatorManipulatorInfoOutput {
  @ApiProperty({ type: String })
  manipulatorId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  email: string;
}

export class OperatorSalonInfoOutput {
  @ApiProperty({ type: String })
  salonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  phone: string;
}

export enum OperatorChangeStatusAction {
  COMPLETE = 'complete',
  CANCELED = 'cancel',
}

export interface ValidatedReservationData {
  couponUse?: any;
  ticketUse?: any;
  manipulator: ManipulatorDocument;
  paymentMethod: any;
  menu: MenuInfo;
  salon: SalonDocument;
}
