import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLogger } from '@src/common/services/app-logger.service';
import { SalonRepository } from '@src/salon/repositories/salon.repository';
import { SalonScheduleService } from '../services/salon-schedule.service';
import { SalonStatus } from '@src/salon/contracts/type';
import { ScheduleTaskRepository } from '../repositories/schedule-task.repository';
import { DateUtilService } from '@src/common/services/date-utils.service';

@Injectable()
export class GenerateSalonScheduleTask {
  constructor(
    private readonly appLogger: AppLogger,
    private readonly salonScheduleService: SalonScheduleService,
    private readonly salonRepository: SalonRepository,
    private readonly scheduleTaskRepository: ScheduleTaskRepository,
    private readonly dateUtilService: DateUtilService,
  ) {}

  // Running on 21h (JP) every 1st day of month
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleCron() {
    // @TODO: considering using the queue for running schedule task in the future (due to size of data)
    const currentDate = this.dateUtilService.getTzStartOfDay(new Date());
    const task = await this.scheduleTaskRepository.findOneAndUpdate(
      { date: currentDate },
      { name: 'GenerateSalonScheduleTask' },
      { upsert: true },
    );

    if (
      (task && task.isRunning) ||
      (task && !task.isRunning && task.status === 'DONE')
    ) {
      // the task has been running by another process
      // terminate the current process to avoid overlap
      return;
    }

    try {
      const salons = await this.salonRepository.find({
        conditions: { status: SalonStatus.VALID },
      });

      for (const salon of salons) {
        await this.salonScheduleService.generateSalonSchedulesInMonths(
          salon._id.toHexString(),
          salon.businessHours || [],
          1,
        );
      }

      // update status of schedule task.
      await this.scheduleTaskRepository.findOneAndUpdate(
        { date: currentDate },
        { isRunning: false, status: 'DONE' },
      );

      this.appLogger.log('Generated the salon schedules');
    } catch (error) {
      const { message, stack, context } = error;
      this.appLogger.error(message, stack, context);
    }
  }
}
