import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { SalonScheduleService } from '../services/salon-schedule.service';
import { SalonRepository } from '@src/salon/repositories/salon.repository';
import { SalonStatus } from '@src/salon/contracts/type';

@Injectable()
export class GenerateSalonScheduleCommand {
  constructor(
    private readonly salonScheduleService: SalonScheduleService,
    private salonRepository: SalonRepository,
  ) {}

  @Command({
    command: 'generate:salon-schedules',
    describe: 'Generating salon schedules',
  })
  async generateSchedules() {
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
  }
}
