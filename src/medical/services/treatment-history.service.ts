import { Injectable } from '@nestjs/common';
import { QueryOptions } from 'mongoose';
import { TreatmentHistoryRepository } from '../repositories/treatment-history.repository';
import { TreatmentHistoryDocument } from '../schemas/treatment-history.schema';

@Injectable()
export class TreatmentHistoryService {
  constructor(public treatmentHistoryRepository: TreatmentHistoryRepository) {}

  /**
   * Create new treatment history record
   *
   * @param {Partial<PaymentDocument>} data
   * @return {Promise<PaymentDocument>}
   */
  async createHistoryRecord(
    data: Partial<TreatmentHistoryDocument>,
    options?: QueryOptions | undefined,
  ): Promise<TreatmentHistoryDocument> {
    return this.treatmentHistoryRepository.create(data, options);
  }
}
