import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ReservationCustomerInfo,
  ReservationInfo,
} from '@src/reservation/contracts/value-object';
import {
  ManipulatorInfoOutput,
  SalonInfoOutput,
} from '@src/reservation/contracts/types';
import { TreatmentFile } from '@src/medical/contracts/value-object';

export class TreatmentDetail {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  treatmentInfo: string;

  @ApiProperty({ type: TreatmentFile })
  treatmentFile: TreatmentFile;
}

export class ReservationDetail {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  customerInfo: ReservationCustomerInfo;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  cancelDeadline: Date;

  @ApiProperty()
  plan: ReservationInfo;

  @ApiProperty()
  result: ReservationInfo;

  @ApiProperty()
  salonInfo: SalonInfoOutput;

  @ApiProperty()
  manipulatorInfo: ManipulatorInfoOutput;

  @ApiProperty({ type: TreatmentDetail })
  treatmentInfo: any;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  couponDiscount?: number;

  @ApiProperty({ type: Number })
  @ApiPropertyOptional()
  ticketUsed?: number;

  @ApiProperty()
  status: string;
}

export class ReservationDetailResponse {
  @ApiProperty({ type: ReservationDetail })
  data: ReservationDetail;
}
