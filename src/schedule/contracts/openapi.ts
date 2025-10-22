import { ApiProperty } from '@nestjs/swagger';
import { ManipulatorDailyScheduleResult } from './type';

export class ReservationItem {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: String, example: '2023-02-06T02:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ type: String, example: '2023-02-06T03:00:00.000Z' })
  endTime: Date;

  @ApiProperty({
    isArray: true,
    type: Date,
    example: ['2023-02-06T02:00:00.000Z', '2023-02-06T02:30:00.000Z'],
  })
  slots: Date[];
}

export class ScheduleItem {
  @ApiProperty()
  manipulatorId: string;

  @ApiProperty()
  manipulatorName: string;

  @ApiProperty()
  manipulatorKana: string;

  @ApiProperty({ isArray: true, type: ReservationItem })
  reservations: ReservationItem[];

  @ApiProperty({
    isArray: true,
    type: Date,
    example: ['2023-02-06T02:00:00.000Z', '2023-02-06T02:30:00.000Z'],
  })
  availableTimeSlots: Date[];
}

export class ScheduleList {
  @ApiProperty()
  totalDocs: number;

  @ApiProperty({ isArray: true, type: ScheduleItem })
  docs: ScheduleItem;
}

export class ScheduleListResponse {
  @ApiProperty({ type: ScheduleList })
  data: ScheduleList;
}

export class ManipulatorDailyScheduleResponse {
  @ApiProperty({ type: ManipulatorDailyScheduleResult })
  data: ManipulatorDailyScheduleResult;
}
