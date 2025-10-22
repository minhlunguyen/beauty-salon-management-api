import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationModule } from '@src/reservation/reservation.module';
import { SalonModule } from '@src/salon/salon.module';
import { ScheduleController } from './controllers/manipulator/schedule.controller';
import { DailyScheduleRepository } from './repositories/daily-schedule.repository';
import { SalonScheduleRepository } from './repositories/salon-schedule.repository';
import {
  DailySchedule,
  DailyScheduleSchema,
} from './schemas/daily-schedule.schema';
import {
  SalonSchedule,
  SalonScheduleSchema,
} from './schemas/salon-schedule.schema';
import { DailyScheduleService } from './services/daily-schedule.service';
import { SalonScheduleService } from './services/salon-schedule.service';
import { GenerateSalonScheduleCommand } from './commands/generate-salon-schedule.command';
import { GenerateManipulatorScheduleCommand } from './commands/generate-manipulator-schedule.command';
import { GenerateSalonScheduleTask } from './tasks/generate-salon-schedule.task';
import {
  ScheduleTask,
  ScheduleTaskSchema,
} from './schemas/schedule-task.schema';
import { ScheduleTaskRepository } from './repositories/schedule-task.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailySchedule.name, schema: DailyScheduleSchema },
      { name: SalonSchedule.name, schema: SalonScheduleSchema },
      { name: ScheduleTask.name, schema: ScheduleTaskSchema },
    ]),
    ReservationModule,
    SalonModule,
  ],
  providers: [
    DailyScheduleService,
    DailyScheduleRepository,
    SalonScheduleService,
    SalonScheduleRepository,
    ScheduleTaskRepository,
    GenerateSalonScheduleCommand,
    GenerateManipulatorScheduleCommand,
    GenerateSalonScheduleTask,
  ],
  exports: [
    DailyScheduleService,
    DailyScheduleRepository,
    SalonScheduleService,
  ],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
