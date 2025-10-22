import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { ManipulatorRepository } from '@src/account/repositories/manipulator.repository';
import { ManipulatorType } from '@src/account/schemas/manipulator.schema';
import { DailyScheduleService } from '../services/daily-schedule.service';

@Injectable()
export class GenerateManipulatorScheduleCommand {
  constructor(
    private readonly dailyScheduleService: DailyScheduleService,
    private readonly manipulatorRepository: ManipulatorRepository,
  ) {}

  @Command({
    command: 'generate:manipulator-schedules',
    describe: 'Generating manipulator schedules',
  })
  async generateSchedules() {
    const manipulators = await this.manipulatorRepository.find({
      conditions: { type: ManipulatorType.NORMAL },
    });

    for (const manipulator of manipulators) {
      await this.dailyScheduleService.generateManipulatorDailySchedulesInMonths(
        manipulator._id.toHexString(),
        manipulator.defaultShifts || [],
        1,
      );
    }
  }
}
