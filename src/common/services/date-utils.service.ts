import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessHour, TimeShift } from '@src/salon/contracts/value-object';
import * as moment from 'moment-timezone';
import { ITimeRange } from '../contracts/type';

@Injectable()
export class DateUtilService {
  constructor(private configService: ConfigService) {}

  /**
   * Convert time to a default data to compare
   *
   * @param {string} data
   * @returns {Date}
   */
  public timeToDefaultDateUtc(data: string): Date {
    const defaultDate = this.configService.get<string>('defaultDatetime');
    return moment(defaultDate.replace('{HH:MM}', data)).toDate();
  }

  /**
   * Convert UTC datetime to local time (HH:MM)
   * @param {Date} date
   * @param {string} timezone
   * @returns {string}
   */
  public utcToLocalTime(
    date: Date,
    format = 'HH:mm',
    timezone?: string | undefined,
  ): string {
    return this.getTzMoment(date, timezone).format(format);
  }

  /**
   * Convert UTC datetime to local time (HH:MM)
   * @param {Date} date
   * @param {string} timezone
   * @returns {number}
   */
  public getTzWeekDay(date: Date, timezone?: string | undefined): number {
    return this.getTzMoment(date, timezone).day();
  }

  /**
   * Convert UTC datetime to local time (HH:MM)
   * @param {Date} date
   * @param {string} timezone
   * @returns {Date}
   */
  public getTzStartOfDay(date: Date, timezone?: string | undefined): Date {
    return this.getTzMoment(date, timezone).startOf('day').toDate();
  }

  /**
   * Convert UTC datetime to local time (HH:MM)
   * @param {Date} date
   * @param {string} timezone
   * @returns {Date}
   */
  public getTzEndOfDay(date: Date, timezone?: string | undefined): Date {
    return this.getTzMoment(date, timezone).endOf('day').toDate();
  }

  /**
   * get timezone moment instance
   *
   * @param {Date} date
   * @param {string|undefined} timezone
   * @returns {moment.Moment}
   */
  public getTzMoment(date: Date, timezone?: string | undefined): moment.Moment {
    const defaultTimezone = this.configService.get<string>('defaultTimezone');
    return moment(date).tz(timezone ?? defaultTimezone);
  }

  /**
   * get timezone moment instance
   *
   * @param {Date} date
   * @param {string|undefined} timezone
   * @returns {moment.Moment}
   */
  public getTzMomentFromString(
    date: string,
    format = 'YYYY-MM-DD HH:mm',
    timezone?: string | undefined,
  ): moment.Moment {
    const defaultTimezone = this.configService.get<string>('defaultTimezone');
    return moment.tz(date, format, timezone ?? defaultTimezone);
  }

  /**
   * Get available time slots
   *
   * @param {Params} params
   * @returns {string[]}
   */
  public getAvailableTimeSlots<
    Params extends {
      nextSlot?: number;
      breakTime?: any[];
      workingTime: any[];
    },
  >(params: Params): string[] {
    let slotTime = moment('00:00', 'HH:mm');
    const endTime = moment('23:59', 'HH:mm');
    const breakTime = params?.breakTime || [];
    const nextSlot = params?.nextSlot || 30;

    const times = [];
    while (slotTime < endTime) {
      if (
        !this.isInRange(slotTime, breakTime) &&
        this.isInRange(slotTime, params.workingTime)
      ) {
        times.push(slotTime.format('HH:mm'));
      }
      slotTime = slotTime.add(nextSlot, 'minutes');
    }

    return times;
  }

  public isInRange(slotTime: moment.Moment, breakTimes: any[]): boolean {
    return breakTimes.some((br) => {
      return (
        slotTime >= moment(br[0], 'HH:mm') && slotTime < moment(br[1], 'HH:mm')
      );
    });
  }

  public getTimeSlotsInRange(
    startTime: Date,
    endTime: Date,
    nextSlot = 30,
  ): Date[] {
    let slotTime = moment(startTime);
    const end = moment(endTime);
    const times = [];
    while (slotTime.isBefore(end)) {
      times.push(slotTime.toDate());
      slotTime = slotTime.add(nextSlot, 'minutes');
    }
    return times;
  }

  /**
   * Get time slots by time ranges
   *
   * @param {ITimeRange[]} times
   * @returns {Date[]}
   */
  public getTimeSlotsByTimeRange(times: ITimeRange[]): Date[] {
    let timeSlots: Date[] = [];
    times.forEach((time) => {
      timeSlots = timeSlots.concat(
        this.getTimeSlotsInRange(time.startTime as Date, time.endTime as Date),
      );
    });
    return timeSlots;
  }

  /**
   * Checking date is before
   *
   * @param {Date} date
   * @param {string} timezone
   * @returns {boolean}
   */
  public isBeforeDate(date: Date, timezone?: string | undefined): boolean {
    const currentDate = this.getTzMoment(new Date(), timezone).startOf('day');
    const checkDate = this.getTzMoment(date, timezone).startOf('day');
    return currentDate.isBefore(checkDate);
  }

  /**
   * Parse the working time to the local time
   * @param {BusinessHour[]} data
   * @returns {BusinessHour[]}
   */
  public parseWorkingTimeToLocalTime(data: BusinessHour[]): BusinessHour[] {
    return data.map((businessHour: BusinessHour) => {
      return {
        weekDay: businessHour.weekDay,
        isHoliday: businessHour.isHoliday,
        hours: businessHour.hours.map((time: TimeShift) => ({
          startTime: this.utcToLocalTime(time.startTime as Date),
          endTime: this.utcToLocalTime(time.endTime as Date),
        })),
      };
    });
  }

  /**
   * get the default working slots
   *
   * @param {BusinessHour[]} defaultShifts
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns
   */
  public getDefaultWorkingSlots(
    defaultShifts: BusinessHour[],
    startDate: Date,
    endDate: Date,
  ): Date[] {
    const date = this.getTzMoment(startDate).startOf('day');
    const end = this.getTzMoment(endDate).endOf('day');
    let slots = [];
    while (date.isBefore(end)) {
      const weekDay = date.day();
      const workingDay = defaultShifts.find((d) => d.weekDay == weekDay);
      if (!workingDay || workingDay.isHoliday === true) {
        date.add(1, 'day');
        continue;
      }
      slots = this.getWorkingTimeSlots(date, workingDay.hours);
      date.add(1, 'day');
    }

    return slots;
  }

  public getWorkingTimeSlots(date: moment.Moment, times: ITimeRange[]): Date[] {
    const timeRanges = times.map((range) => {
      // get date in default timezone (JP)
      const tzDate = date.format('YYYY-MM-DD');

      // convert to get hour + minutes to default timezone (JP)
      const tzStartTime = this.utcToLocalTime(range.startTime as Date, 'HH:mm');
      const tzEndTime = this.utcToLocalTime(range.endTime as Date, 'HH:mm');

      // concat the date and time as default timezone (JP) before store them into database as UTC
      return {
        startTime: this.getTzMomentFromString(
          `${tzDate} ${tzStartTime}`,
        ).toDate(),
        endTime: this.getTzMomentFromString(`${tzDate} ${tzEndTime}`).toDate(),
      };
    });

    return this.getTimeSlotsByTimeRange(timeRanges);
  }

  /**
   * get schedule date ranges
   *
   * @param {Date} date
   * @param {string|undefined} timezone
   * @returns {moment.Moment}
   */
  public getScheduleDateRange(
    startDate: Date,
    endDate: Date,
    timezone?: string | undefined,
  ): Date[] {
    const ranges = [];
    const start = this.getTzMoment(startDate, timezone).startOf('day');
    const end = this.getTzMoment(endDate, timezone).endOf('day');
    while (start.isBefore(end)) {
      ranges.push(start.toDate());
      start.add(1, 'day');
    }

    return ranges;
  }

  /**
   * Return number of difference
   * @param {Date} start
   * @param {Date} end
   * @returns {number}
   */
  public diffInMinutes(start: Date, end: Date): number {
    return this.getTzMoment(end).diff(this.getTzMoment(start), 'minute');
  }

  /**
   * Split time range by duration
   *
   * @param {Date} startTime
   * @param {Date} endTime
   * @param {number} duration
   * @returns {IOutput[]}
   */
  public splitTimeRangeByDuration<
    IOutput extends { startTime: Date; endTime: Date },
  >(startTime: Date, endTime: Date, duration: number): IOutput[] {
    const start = moment(startTime);
    const end = moment(endTime);

    const times: IOutput[] = [];
    while (start.isBefore(end)) {
      times.push({
        startTime: start.toDate(),
        endTime: moment(start).add(duration, 'minutes').toDate(),
      } as IOutput);
      start.add(duration, 'minutes');
    }
    return times;
  }
}
