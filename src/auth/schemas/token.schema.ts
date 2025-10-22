import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type TokenDocument = HydratedDocument<Token>;

@Schema({
  timestamps: true,
})
export class Token {
  @Prop()
  token: string;

  @Prop()
  expiredAt: Date;

  @Prop()
  role: string;

  @Prop()
  userId: string;

  @Prop()
  deviceId: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
TokenSchema.plugin(paginate);
