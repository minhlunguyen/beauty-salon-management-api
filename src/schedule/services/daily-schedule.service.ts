import { Injectable } from '@nestjs/common';
import { ManipulatorRepository } from '@src/account/repositories/manipulator.repository';
import { DateUtilService } from '@src/common/services/date-utils.service';
import { QueryOptions, Types } from 'mongoose';
import {
  ManipulatorDailyScheduleResult,
  ManipulatorScheduleResult,
} from '../contracts/type';
import { UpdateManipulatorDailyScheduleDto } from '../dtos/update-manipulator-schedule.dto';
import { DailySchedule } from '../schemas/daily-schedule.schema';
import { ReservationRepository } from '@src/reservation/repositories/reservation.repository';
import { TimeRange } from '../contracts/value-object';
import { DailyScheduleRepository } from '../repositories/daily-schedule.repository';
import { BusinessHour } from '@src/salon/contracts/value-object';
import { Errors } from '../contracts/error';
import { AppException } from '@src/common/exceptions/app.exception';
import {
  differenceBy as _differenceBy,
  intersectionBy as _intersectionBy,
  isEmpty as _isEmpty,
  uniq as _uniq,
} from 'lodash';
import { SalonScheduleService } from './salon-schedule.service';
import { ManipulatorDocument } from '@src/account/schemas/manipulator.schema';

@Injectable()
export class DailyScheduleService {
  constructor(
    private dailyScheduleRepository: DailyScheduleRepository,
    private manipulatorRepository: ManipulatorRepository,
    private reservationRepository: ReservationRepository,
    private dateUtilService: DateUtilService,
    private salonScheduleService: SalonScheduleService,
  ) {}

  async getDailySchedules<
    ListParams extends {
      salonId: string;
      selectedDate: Date;
      page?: number;
      limit?: number;
      sort?: Record<string, number>;
    },
  >(params: ListParams): Promise<ManipulatorScheduleResult> {
    const { salonId, selectedDate, page, limit, sort } = params;

    const manResult = await this.manipulatorRepository.getManipulatorBySalonId(
      salonId,
      page,
      limit,
      sort,
    );

    if (_isEmpty(manResult.docs)) {
      return { totalDocs: 0, docs: [] };
    }
    const manipulatorIds = manResult.docs.map((man) => man._id.toHexString());

    // Fetching reservations data
    const reservations = await this.reservationRepository.getReservationsInDate(
      manipulatorIds,
      selectedDate,
    );

    // Fetching available time slot data
    const availableTimeSlots = await this.getScheduleSlotsOfManipulators(
      manipulatorIds,
      selectedDate,
      selectedDate,
      false,
    );

    const data = manResult.docs.map((man) => {
      const manId = man._id.toHexString();
      return {
        manipulatorId: man._id.toHexString(),
        manipulatorName: man.name,
        manipulatorNameKana: man.nameKana,
        reservations: reservations[manId] ?? [],
        availableTimeSlots: availableTimeSlots.get(manId) ?? [],
      };
    });

    const result: ManipulatorScheduleResult = {
      ...manResult,
      docs: data,
    };

    return result;
  }

  /**
   * Get manipulator's daily schedule
   *
   * @param {string} manipulatorId
   * @param {Date} date
   * @returns {Promise<ManipulatorDailyScheduleResult>}
   */
  async getManipulatorDailySchedule(
    salonId: string,
    manipulatorId: string,
    date: Date,
  ): Promise<ManipulatorDailyScheduleResult> {
    const manipulator = await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(manipulatorId),
        'salon.salonId': new Types.ObjectId(salonId),
      },
      selectedFields: ['_id', 'defaultShifts'],
    });

    let dailySchedule: DailySchedule =
      await this.dailyScheduleRepository.findOne({
        conditions: {
          manipulatorId: new Types.ObjectId(manipulatorId),
          date: this.dateUtilService.getTzStartOfDay(date),
        },
      });

    const reservations = await this.reservationRepository.getReservationsInDate(
      [manipulatorId],
      date,
    );

    if (!dailySchedule) {
      const weekDay = this.dateUtilService.getTzMoment(date).day();
      const workingTime = manipulator.defaultShifts?.find(
        (workingDay) => workingDay.weekDay === weekDay,
      );

      dailySchedule = new DailySchedule();
      dailySchedule.date = date;
      dailySchedule.isDayOff = workingTime.isHoliday || false;
      dailySchedule.workingTime = workingTime.hours.map((time) => ({
        startTime: time.startTime as Date,
        endTime: time.endTime as Date,
      }));
    }

    const result: ManipulatorDailyScheduleResult = {
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
      reservations: reservations[manipulatorId] ?? [],
    };

    return result;
  }

  /**
   * Get manipulator's daily schedule
   *
   * @param {string} salonId
   * @param {string} manipulatorId
   * @param {UpdateManipulatorDailyScheduleDto} dto
   * @returns {Promise<ManipulatorDailyScheduleResult>}
   */
  async updateManipulatorSchedule(
    salonId: string,
    manipulatorId: string,
    dto: UpdateManipulatorDailyScheduleDto,
  ): Promise<ManipulatorDailyScheduleResult> {
    await this.manipulatorRepository.firstOrFail({
      conditions: {
        _id: new Types.ObjectId(manipulatorId),
        'salon.salonId': new Types.ObjectId(salonId),
      },
      selectedFields: ['_id', 'defaultShifts'],
    });

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
    const reservations = await this.reservationRepository.getReservationsInDate(
      [manipulatorId],
      dto.date,
    );
    if (reservations[manipulatorId]) {
      if (dto.isDayOff) {
        const { code, message, status } = Errors.TIME_CHANGE_INVALID;
        throw new AppException(code, message, status);
      }

      const scheduleSlots = this._getTimeSlotsByTimeRange(workingTime);
      for (const reservation of reservations[manipulatorId]) {
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

    const dailySchedule: DailySchedule =
      await this.dailyScheduleRepository.findOneAndUpdate(
        {
          manipulatorId: new Types.ObjectId(manipulatorId),
          date: momentTz.startOf('day').toDate(),
        },
        {
          date: momentTz.startOf('day').toDate(),
          workingTime: workingTime,
          isDayOff: dto.isDayOff,
        },
        { upsert: true, new: true },
      );

    const result: ManipulatorDailyScheduleResult = {
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
   * Get manipulators who be in day off in the date
   *
   * @param {Date} date
   * @returns Promise<string[]>
   */
  async getManipulatorIdsInDayOff(date: Date): Promise<string[]> {
    const manipulators = await this.dailyScheduleRepository.find({
      conditions: {
        isDayOff: true,
        date: this.dateUtilService.getTzStartOfDay(date),
      },
      selectedFields: ['manipulatorId'],
    });
    return manipulators?.map((man) => man.manipulatorId.toHexString()) || [];
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

  /**
   * Generating the manipulator daily schedules
   *
   * @param {string} manipulatorId
   * @param {BusinessHour[]} wtSetting
   * @param {number} nextMonths
   * @param {QueryOptions | undefined} options
   * @returns {Promise<boolean>}
   */
  async generateManipulatorDailySchedulesInMonths(
    manipulatorId: string,
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
      manipulatorId,
      dateMoment.startOf('day').toDate(),
      endDateMoment.startOf('day').toDate(),
    );

    const scheduleData: DailySchedule[] = [];
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

      const dailySchedule = {
        manipulatorId: new Types.ObjectId(manipulatorId),
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
      scheduleData.push(dailySchedule);

      // moving to next date
      dateMoment = dateMoment.add(1, 'days');
    }

    if (scheduleData.length) {
      await this.dailyScheduleRepository.model.insertMany(
        scheduleData,
        options,
      );
    }

    return true;
  }

  /**
   * Get the adjusted schedules in date range
   *
   * @param {string} manipulatorId
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Map<number, boolean>>}
   */
  async _getAdjustedSchedule(
    manipulatorId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Map<number, boolean>> {
    const existedSchedules = await this.dailyScheduleRepository.find({
      conditions: {
        manipulatorId: new Types.ObjectId(manipulatorId),
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
   * get available slots of manipulators
   *
   * @param {string[]} manipulatorIds
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Date[]>}
   */
  async getScheduleSlotsOfManipulators(
    manipulatorIds: string[],
    startDate: Date,
    endDate: Date,
    checkSalonWT = true,
  ): Promise<Map<string, Date[]>> {
    // retrieving daily schedules of manipulator in the date range
    const manIds = manipulatorIds.map((id) => new Types.ObjectId(id));
    const manipulators = await this.manipulatorRepository.find({
      conditions: { _id: { $in: manIds } },
      selectedFields: ['_id', 'defaultShifts', 'salon'],
    });

    const availableSlots = await this.getTimeSlotsOfManipulatorByDateRange(
      manipulators,
      startDate,
      endDate,
    );

    const salonAvailableSlots =
      await this.salonScheduleService.getScheduleSlotsOfSalons(
        manipulators.map((man) => man.salon[0].salonId.toHexString()),
        startDate,
        endDate,
      );

    for (const manipulator of manipulators) {
      const manId = manipulator._id.toHexString();
      const salonId = manipulator.salon[0].salonId.toHexString();
      const isOwner = manipulator.salon[0].authority === 'owner';

      // If is owner aways follow up the salon schedule
      // TODO: need adjust the logic in the next version.
      if (isOwner) {
        availableSlots.set(manId, salonAvailableSlots.get(salonId));
        continue;
      }

      if (!availableSlots.has(manId)) {
        // Using the default working time if the manipulator have no daily schedule.
        availableSlots.set(
          manId,
          this.dateUtilService.getDefaultWorkingSlots(
            manipulator.defaultShifts,
            startDate,
            endDate,
          ),
        );
      }

      if (checkSalonWT) {
        availableSlots.set(
          manId,
          _intersectionBy(
            availableSlots.get(manId),
            salonAvailableSlots.get(salonId),
            (date: Date) => date.getTime(),
          ),
        );
      }
    }

    return availableSlots;
  }

  /**
   * get time slots of manipulators by date ranges
   *
   * @param {string[]} manipulatorIds
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Date[]>}
   */
  async getTimeSlotsOfManipulatorByDateRange(
    manipulators: ManipulatorDocument[],
    startDate: Date,
    endDate: Date,
    extendSlots = false,
  ): Promise<Map<string, Date[]>> {
    // retrieving daily schedules of manipulator in the date range
    const startTime = this.dateUtilService.getTzStartOfDay(startDate);
    const endTime = this.dateUtilService.getTzEndOfDay(endDate);
    const manIds = _uniq(manipulators.map((man) => man._id));

    const schedules = await this.dailyScheduleRepository.find({
      conditions: {
        manipulatorId: { $in: manIds },
        date: { $gte: startTime, $lte: endTime },
      },
    });
    const dateRange = this.dateUtilService.getScheduleDateRange(
      startDate,
      endDate,
    );

    const defaultSlots = new Map<string, { [key: number]: Date[] }>();
    if (extendSlots) {
      for (const manipulatorObj of manipulators) {
        const mId = manipulatorObj._id.toHexString();
        if (!defaultSlots.has(mId)) defaultSlots.set(mId, []);

        for (const date of dateRange) {
          const dayMoment = this.dateUtilService.getTzMoment(date);
          const weekDay = dayMoment.day();
          const workingDay = manipulatorObj.defaultShifts.find(
            (d) => d.weekDay == weekDay,
          );

          const daySchedule = defaultSlots.get(mId);
          if (!workingDay || workingDay.isHoliday === true) {
            daySchedule[date.getTime()] = [];
            defaultSlots.set(mId, daySchedule);
            continue;
          }

          daySchedule[date.getTime()] =
            this.dateUtilService.getWorkingTimeSlots(
              dayMoment,
              workingDay.hours,
            );
          defaultSlots.set(mId, daySchedule);
        }
      }
    }

    const availableSlots = new Map<string, Date[]>();
    for (const manipulator of manipulators) {
      const mId = manipulator._id.toHexString();
      if (!availableSlots.has(mId)) availableSlots.set(mId, []);

      for (const date of dateRange) {
        const manSchedule = schedules.find(
          (s) =>
            s.date.getTime() === date.getTime() &&
            mId === s.manipulatorId.toHexString(),
        );

        if (manSchedule) {
          if (!manSchedule.isDayOff) {
            availableSlots.set(
              mId,
              availableSlots
                .get(mId)
                .concat(
                  this.dateUtilService.getTimeSlotsByTimeRange(
                    manSchedule?.workingTime || [],
                  ),
                ),
            );
          }
        } else if (defaultSlots.has(mId)) {
          const defaultSlot = defaultSlots.get(mId);
          availableSlots.set(
            mId,
            availableSlots.get(mId).concat(defaultSlot[date.getTime()] ?? []),
          );
        }
      }
    }

    return availableSlots;
  }
}
