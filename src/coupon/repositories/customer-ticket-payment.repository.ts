import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import {
  CustomerTicketPaymentDocument,
  CustomerTicketPayment,
} from '../schemas/customer-ticket-payment.schema';

@Injectable()
export class CustomerTicketPaymentRepository extends AbstractRepository<CustomerTicketPaymentDocument> {
  constructor(
    @InjectModel(CustomerTicketPayment.name)
    model: PaginateModel<CustomerTicketPaymentDocument>,
  ) {
    super(model);
  }
}
