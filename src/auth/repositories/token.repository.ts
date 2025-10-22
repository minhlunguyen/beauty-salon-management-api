import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocument } from '@src/auth/schemas/token.schema';

@Injectable()
export class TokenRepository extends AbstractRepository<TokenDocument> {
  constructor(@InjectModel(Token.name) model: PaginateModel<TokenDocument>) {
    super(model);
  }
}
