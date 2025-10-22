import { Injectable } from '@nestjs/common';
import { QueryOptions, Types } from 'mongoose';
import { ReservationHistoryRepository } from '../repositories/reservation-history.repository';
import { ReservationHistoryDocument } from '../schemas/reservation-history.schema';

@Injectable()
export class ReservationHistoryService {
  constructor(private historyRepository: ReservationHistoryRepository) {}

  /**
   * Get history by reservation id
   *
   * @param {string} reservationId
   * @returns Promise<ReservationHistoryDocument[]>
   */
  async getHistoryByReservationId(
    reservationId: string,
  ): Promise<ReservationHistoryDocument[]> {
    return await this.historyRepository.find({
      conditions: { reservation: new Types.ObjectId(reservationId) },
      selectedFields: ['reservation', 'status', 'updatedAt'],
    });
  }

  /**
   * Create new history record
   *
   * @param {Partial<ReservationHistoryDocument>} data
   * @param {QueryOptions} options
   *
   * @return {Promise<ReservationHistoryDocument>}
   */
  async createNewHistoryRecord(
    data: Partial<ReservationHistoryDocument>,
    options?: QueryOptions | undefined,
  ): Promise<ReservationHistoryDocument> {
    return this.historyRepository.create(data, options);
  }
}
