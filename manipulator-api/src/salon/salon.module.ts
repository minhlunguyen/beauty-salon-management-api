import { Module } from '@nestjs/common';
import { SymptomService } from './services/symptom.service';
import { SymptomRepository } from './repositories/symptom.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Symptom, SymptomSchema } from './schemas/symptom.schema';
import { SeedSymptomCommand } from './commands/seed.symptom.command';
import { DataController } from './controllers/common/data.controller';
import { FeatureService } from './services/feature.service';
import { FeatureRepository } from './repositories/feature.repository';
import { Feature, FeatureSchema } from './schemas/feature.schema';
import { SeedFeatureCommand } from './commands/seed.feature.command';
import { Salon, SalonSchema } from './schemas/salon.schema';
import { SalonRepository } from './repositories/salon.repository';
import { SalonService } from './services/salon.service';
import { MediaModule } from '@src/media/media.module';
import { Station, StationSchema } from './schemas/station.schema';
import { StationService } from './services/station.service';
import { StationRepository } from './repositories/station.repository';
import { SeedStationCommand } from './commands/seed.station.command';
import { BankRepository } from './repositories/bank.repository';
import { BankService } from './services/bank.service';
import { SeedBankCommand } from './commands/seed.bank.command';
import { Bank, BankSchema } from './schemas/bank.schema';
import { BankBranch, BankBranchSchema } from './schemas/bank-branch.schema';
import { BankBranchRepository } from './repositories/bank-branch.repository';
import { BankBranchService } from './services/bank-branch.service';
import { SeedBankBranchCommand } from './commands/seed.bank-branch.command';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MenuRepository } from './repositories/menu.repository';
import { MenuService } from './services/menu.service';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';
import { Area, AreaSchema } from './schemas/area.schema';
import { AreaService } from './services/area.service';
import { AreaRepository } from './repositories/area.repository';
import { SeedAreaCommand } from './commands/seed.area.command';
import { SalonController } from './controllers/manipulator/salon.controller';
import { LineService } from './services/line.service';
import { Line, LineSchema } from './schemas/line.schema';
import { LineRepository } from './repositories/line.repository';
import { SeedLineCommand } from './commands/seed.line.command';
import { MenuController } from './controllers/manipulator/menu.controller';
import { OperatorSalonController } from './controllers/operator/salon.controller';
import { TicketRepository } from './repositories/ticket.repository';
import { Ticket, TicketSchema } from './schemas/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Symptom.name, schema: SymptomSchema },
      { name: Feature.name, schema: FeatureSchema },
      { name: Salon.name, schema: SalonSchema },
      { name: Station.name, schema: StationSchema },
      { name: Line.name, schema: LineSchema },
      { name: Bank.name, schema: BankSchema },
      { name: BankBranch.name, schema: BankBranchSchema },
      { name: Menu.name, schema: MenuSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Area.name, schema: AreaSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    MediaModule,
  ],
  providers: [
    SymptomService,
    SymptomRepository,
    SeedSymptomCommand,
    FeatureService,
    FeatureRepository,
    SeedFeatureCommand,
    SalonRepository,
    SalonService,
    SeedLineCommand,
    LineRepository,
    LineService,
    StationService,
    StationRepository,
    SeedStationCommand,
    BankRepository,
    BankService,
    SeedBankCommand,
    BankBranchRepository,
    BankBranchService,
    SeedBankBranchCommand,
    MenuRepository,
    MenuService,
    ReviewRepository,
    ReviewService,
    AreaService,
    AreaRepository,
    SeedAreaCommand,
    TicketRepository,
  ],
  exports: [
    SalonService,
    SalonRepository,
    SymptomRepository,
    MenuService,
    MenuRepository,
    TicketRepository,
  ],
  controllers: [
    DataController,
    SalonController,
    MenuController,
    OperatorSalonController,
  ],
})
export class SalonModule {}
