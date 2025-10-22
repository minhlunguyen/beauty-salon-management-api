import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import * as bcrypt from 'bcrypt';

export type OperatorDocument = HydratedDocument<Operator>;
export const statuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
};
@Schema({
  timestamps: true,
})
export class Operator {
  @Prop({ maxlength: 255, lowercase: true })
  email: string;

  @Prop()
  password: string;

  @Prop({
    default: statuses.ACTIVE,
  })
  status: string;

  @Prop({ maxlength: 10 })
  fullName: string;
}

export const OperatorSchema = SchemaFactory.createForClass(Operator);
OperatorSchema.plugin(paginate);
OperatorSchema.pre('save', async function () {
  // hash password
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
