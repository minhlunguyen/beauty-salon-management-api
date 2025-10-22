import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentHistoryRepository } from './repositories/treatment-history.repository';
import {
  TreatmentHistory,
  TreatmentHistorySchema,
} from './schemas/treatment-history.schema';
import { TreatmentHistoryService } from './services/treatment-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TreatmentHistory.name, schema: TreatmentHistorySchema },
    ]),
  ],
  providers: [TreatmentHistoryRepository, TreatmentHistoryService],
  exports: [TreatmentHistoryService],
  controllers: [],
})
export class MedicalModule {}
