import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '@src/payment/schemas/payment.schema';

@Injectable()
export class PaymentRepository extends AbstractRepository<PaymentDocument> {
  constructor(
    @InjectModel(Payment.name) model: PaginateModel<PaymentDocument>,
  ) {
    super(model);
  }
}
