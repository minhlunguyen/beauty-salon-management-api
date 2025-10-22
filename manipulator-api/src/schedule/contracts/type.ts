import { ApiProperty } from '@nestjs/swagger';

export interface ManipulatorSchedule {
  manipulatorId: string;
  manipulatorName: string;
  manipulatorNameKana: string;
  reservations: any[];
  availableTimeSlots: Date[];
}

export interface ManipulatorScheduleResult {
  docs: ManipulatorSchedule[];
  totalDocs: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  pagingCounter?: number;
}

export class TimeRangeResult {
  @ApiProperty({ example: '08:00' })
  startTime: string;

  @ApiProperty({ example: '09:00' })
  endTime: string;
}

export class ManipulatorDailyScheduleResult {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: Boolean })
  isDayOff: boolean;

  @ApiProperty({ isArray: true, type: TimeRangeResult })
  workingTime: TimeRangeResult[];

  @ApiProperty()
  reservations?: any[];
}

export class SalonDailyScheduleResult {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: Boolean })
  isDayOff: boolean;

  @ApiProperty({ isArray: true, type: TimeRangeResult })
  workingTime: TimeRangeResult[];
}
