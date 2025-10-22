import { Injectable } from '@nestjs/common';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { QueryOptions, Types } from 'mongoose';
import { SalonDailyScheduleResult } from '../contracts/type';
import { SalonScheduleRepository } from '../repositories/salon-schedule.repository';
import { SalonSchedule } from '../schemas/salon-schedule.schema';
import { SalonRepository } from '@src/salon/repositories/salon.repository';
import { UpdateSalonDailyScheduleDto } from '../dtos/update-salon-schedule.dto';
import { ReservationRepository } from '@src/reservation/repositories/reservation.repository';
import { differenceBy as _differenceBy, uniq as _uniq } from 'lodash';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '../contracts/error';
import { TimeRange } from '../contracts/value-object';
import { BusinessHour } from '@src/salon/contracts/value-object';

@Injectable()
export class SalonScheduleService {
  constructor(
    private salonScheduleRepository: SalonScheduleRepository,
    private salonRepository: SalonRepository,
    private dateUtilService: DateUtilService,
    private reservationRepository: ReservationRepository,
  ) {}

  /**
   * Get manipulator's daily schedule
   *
   * @param {string} salonId
   * @param {Date} date
   * @returns {Promise<SalonDailyScheduleResult>}
   */
  async getSalonDailySchedule(
    salonId: string,
    date: Date,
  ): Promise<SalonDailyScheduleResult> {
    let dailySchedule: SalonSchedule =
      await this.salonScheduleRepository.findOne({
        conditions: {
          salonId: new Types.ObjectId(salonId),
          date: this.dateUtilService.getTzStartOfDay(date),
        },
      });

    if (!dailySchedule) {
      const salon = await this.salonRepository.firstOrFail({
        conditions: {
          _id: new Types.ObjectId(salonId),
        },
        selectedFields: ['_id', 'businessHours'],
      });

      const weekDay = this.dateUtilService.getTzMoment(date).day();
      const workingTime = salon.businessHours?.find(
        (workingDay) => workingDay.weekDay === weekDay,
      );

      dailySchedule = new SalonSchedule();
      dailySchedule.date = date;
      dailySchedule.isDayOff = workingTime.isHoliday || false;
      dailySchedule.workingTime = workingTime.hours.map((time) => ({
        startTime: time.startTime as Date,
        endTime: time.endTime as Date,
      }));
    }

    const result: SalonDailyScheduleResult = {
      date: this.dateUtilService.utcToLocalTime(
        dailySchedule.date,
        'YYYY-MM-DD',
      ),
      workingTime: dailySchedule.workingTime.map((timeRange) => ({
        startTime: this.dateUtilService.utcToLocalTime(
          timeRange.startTime,
          'HH:mm',
        ),
        endTime: this.dateUtilService.utcToLocalTime(
          timeRange.endTime,
          'HH:mm',
        ),
      })),
      isDayOff: dailySchedule?.isDayOff || false,
    };

    return result;
  }

  /**
   * Get salon's daily schedule
   *
   * @param {string} salonId
   * @param {UpdateSalonDailyScheduleDto} dto
   * @returns {Promise<UpdateSalonDailyScheduleDto>}
   */
  async updateSalonSchedule(
    salonId: string,
    dto: UpdateSalonDailyScheduleDto,
  ): Promise<SalonDailyScheduleResult> {
    const momentTz = this.dateUtilService.getTzMoment(dto.date);
    const workingTime = dto.workingTime.map((timeRange) => ({
      startTime: this.dateUtilService
        .getTzMomentFromString(
          `${momentTz.format('YYYY-MM-DD')} ${this.dateUtilService
            .getTzMoment(timeRange.startTime)
            .format('HH:mm')}`,
        )
        .toDate(),
      endTime: this.dateUtilService
        .getTzMomentFromString(
          `${momentTz.format('YYYY-MM-DD')} ${this.dateUtilService
            .getTzMoment(timeRange.endTime)
            .format('HH:mm')}`,
        )
        .toDate(),
    }));

    // validate there are any revervation in the ranges of change times
    const reservations =
      await this.reservationRepository.getSalonReservationsInDate(
        [salonId],
        dto.date,
      );
    if (reservations.has(salonId)) {
      if (dto.isDayOff) {
        const { code, message, status } = Errors.TIME_CHANGE_INVALID;
        throw new AppException(code, message, status);
      }

      const scheduleSlots = this._getTimeSlotsByTimeRange(workingTime);
      for (const reservation of reservations.get(salonId)) {
        if (
          _differenceBy(reservation.slots, scheduleSlots, (date: Date) =>
            date.getTime(),
          ).length !== 0
        ) {
          const { code, message, status } = Errors.TIME_CHANGE_INVALID;
          throw new AppException(code, message, status);
        }
      }
    }

    const dailySchedule: SalonSchedule =
      await this.salonScheduleRepository.findOneAndUpdate(
        {
          salonId: new Types.ObjectId(salonId),
          date: momentTz.startOf('day').toDate(),
        },
        {
          date: momentTz.startOf('day').toDate(),
          workingTime: workingTime,
          isDayOff: dto.isDayOff,
        },
        { upsert: true, new: true },
      );

    const result: SalonDailyScheduleResult = {
      date: this.dateUtilService.utcToLocalTime(
        dailySchedule.date,
        'YYYY-MM-DD',
      ),
      workingTime: dailySchedule.workingTime.map((timeRange) => ({
        startTime: this.dateUtilService.utcToLocalTime(
          timeRange.startTime,
          'HH:mm',
        ),
        endTime: this.dateUtilService.utcToLocalTime(
          timeRange.endTime,
          'HH:mm',
        ),
      })),
      isDayOff: dailySchedule.isDayOff,
    };

    return result;
  }

  /**
   * get available slots of manipulators
   *
   * @param {string[]} manipulatorIds
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Date[]>}
   */
  async getScheduleSlotsOfSalons(
    salonIds: string[],
    startDate: Date,
    endDate: Date,
    extendSlots = false,
  ): Promise<Map<string, Date[]>> {
    // retrieving daily schedules of manipulator in the date range
    const startTime = this.dateUtilService.getTzStartOfDay(startDate);
    const endTime = this.dateUtilService.getTzEndOfDay(endDate);
    salonIds = _uniq(salonIds);
    const sIds = salonIds.map((id) => new Types.ObjectId(id));

    const schedules = await this.salonScheduleRepository.find({
      conditions: {
        salonId: { $in: sIds },
        date: { $gte: startTime, $lte: endTime },
      },
    });

    const dateRange = this.dateUtilService.getScheduleDateRange(
      startDate,
      endDate,
    );

    const salonDefautSlots = extendSlots
      ? await this._getSalonDefaultSchedules(sIds, dateRange)
      : new Map<string, { [key: number]: Date[] }>();
    const availableSlots = new Map<string, Date[]>();
    for (const sId of salonIds) {
      if (!availableSlots.has(sId)) availableSlots.set(sId, []);
      for (const date of dateRange) {
        const salonSchedule = schedules.find(
          (s) =>
            s.date.getTime() === date.getTime() &&
            sId === s.salonId.toHexString(),
        );

        if (salonSchedule) {
          if (!salonSchedule.isDayOff) {
            availableSlots.set(
              sId,
              availableSlots
                .get(sId)
                .concat(
                  this.dateUtilService.getTimeSlotsByTimeRange(
                    salonSchedule?.workingTime || [],
                  ),
                ),
            );
          }
        } else if (salonDefautSlots.has(sId)) {
          const defaultSlot = salonDefautSlots.get(sId);
          availableSlots.set(
            sId,
            availableSlots.get(sId).concat(defaultSlot[date.getTime()] ?? []),
          );
        }
      }
    }

    return availableSlots;
  }

  /**
   * _getSalonDefaultSchedules
   *
   * @param {string[]} sIds
   * @param {Date[]} dateRange
   * @returns
   */
  async _getSalonDefaultSchedules(
    sIds: Types.ObjectId[],
    dateRange: Date[],
  ): Promise<Map<string, { [key: number]: Date[] }>> {
    const salonDefautSlots = new Map<string, { [key: number]: Date[] }>();
    const salons = await this.salonRepository.find({
      conditions: { _id: { $in: sIds } },
      selectedFields: ['_id', 'businessHours'],
    });
    for (const salonObj of salons) {
      const sId = salonObj._id.toHexString();
      if (!salonDefautSlots.has(sId)) salonDefautSlots.set(sId, []);
      for (const date of dateRange) {
        const dayMoment = this.dateUtilService.getTzMoment(date);
        const weekDay = dayMoment.day();
        const workingDay = salonObj.businessHours.find(
          (d) => d.weekDay == weekDay,
        );

        const daySchedule = salonDefautSlots.get(sId);
        if (!workingDay || workingDay.isHoliday === true) {
          daySchedule[date.getTime()] = [];
          salonDefautSlots.set(sId, daySchedule);
          continue;
        }

        daySchedule[date.getTime()] = this.dateUtilService.getWorkingTimeSlots(
          dayMoment,
          workingDay.hours,
        );
        salonDefautSlots.set(sId, daySchedule);
      }
    }

    return salonDefautSlots;
  }

  /**
   * Generating the salon daily schedules
   *
   * @param {string} salonId
   * @param {BusinessHour[]} wtSetting
   * @param {number} nextMonths
   * @param {QueryOptions | undefined} options
   * @returns {Promise<boolean>}
   */
  async generateSalonSchedulesInMonths(
    salonId: string,
    wtSetting: BusinessHour[],
    nextMonths = 1,
    options?: QueryOptions | undefined,
  ): Promise<boolean> {
    if (wtSetting.length === 0) {
      return true;
    }

    const currentDate = new Date();

    // To generate the rest dates of the current month and the next months.
    const endDateMoment = this.dateUtilService
      .getTzMoment(currentDate)
      .add(nextMonths, 'months')
      .endOf('month');
    let dateMoment = this.dateUtilService.getTzMoment(currentDate);

    const adjustedSchedules = await this._getAdjustedSchedule(
      salonId,
      dateMoment.startOf('day').toDate(),
      endDateMoment.startOf('day').toDate(),
    );

    const scheduleData: SalonSchedule[] = [];
    while (dateMoment.isBefore(endDateMoment)) {
      const setting = wtSetting.find(
        (st) =>
          st.weekDay === this.dateUtilService.getTzWeekDay(dateMoment.toDate()),
      );

      if (!setting || adjustedSchedules.has(dateMoment.toDate().getTime())) {
        // if have no setting for the date, then moving to next date
        dateMoment = dateMoment.add(1, 'days');
        continue;
      }

      const salonSchedule = {
        salonId: new Types.ObjectId(salonId),
        date: dateMoment.startOf('day').toDate(),
        workingTime: setting.hours.map((time) => {
          // get date in default timezone (JP)
          const tzDate = dateMoment.format('YYYY-MM-DD');

          // convert to get hour + minutes to default timezone (JP)
          const tzStartTime = this.dateUtilService.utcToLocalTime(
            time.startTime as Date,
            'HH:mm',
          );
          const tzEndTime = this.dateUtilService.utcToLocalTime(
            time.endTime as Date,
            'HH:mm',
          );

          // concat the date and time as default timezone (JP) before store them into database as UTC
          return {
            startTime: this.dateUtilService
              .getTzMomentFromString(`${tzDate} ${tzStartTime}`)
              .toDate(),
            endTime: this.dateUtilService
              .getTzMomentFromString(`${tzDate} ${tzEndTime}`)
              .toDate(),
          };
        }),
        isDayOff: setting ? setting.isHoliday : false,
      };
      scheduleData.push(salonSchedule);
      // moving to next date
      dateMoment = dateMoment.add(1, 'days');
    }

    if (scheduleData.length) {
      await this.salonScheduleRepository.model.insertMany(
        scheduleData,
        options,
      );
    }

    return true;
  }

  /**
   * Get the adjusted schedules in date range
   *
   * @param {string} salonId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Map<number, boolean>>}
   */
  async _getAdjustedSchedule(
    salonId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Map<number, boolean>> {
    const existedSchedules = await this.salonScheduleRepository.find({
      conditions: {
        salonId: new Types.ObjectId(salonId),
        date: { $gte: startDate, $lte: endDate },
      },
    });

    const result = new Map<number, boolean>();
    for (const schedule of existedSchedules) {
      result.set(schedule.date.getTime(), true);
    }

    return result;
  }

  /**
   * Get time slots by time ranges
   *
   * @param {TimeRange[]} times
   * @returns {Date[]}
   */
  private _getTimeSlotsByTimeRange(times: TimeRange[]): Date[] {
    let timeSlots: Date[] = [];
    times.forEach((time) => {
      timeSlots = timeSlots.concat(
        this.dateUtilService.getTimeSlotsInRange(time.startTime, time.endTime),
      );
    });
    return timeSlots;
  }
}
