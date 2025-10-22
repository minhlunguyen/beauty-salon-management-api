import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';

@Injectable()
export class TicketRepository extends AbstractRepository<TicketDocument> {
  constructor(@InjectModel(Ticket.name) model: PaginateModel<TicketDocument>) {
    super(model);
  }
}
