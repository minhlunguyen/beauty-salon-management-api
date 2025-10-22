import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export enum statuses {
  DRAFT = 'DRAFT',
  USED = 'USED',
  DELETED = 'DELETED',
}
export type FileDocument = HydratedDocument<File>;
@Schema({
  timestamps: true,
})
export class File {
  @Prop()
  key: string;

  @Prop()
  isPublic: boolean;

  @Prop()
  contentType: string;

  @Prop({
    default: statuses.DRAFT,
    required: true,
  })
  status: string;

  @Prop()
  originalName: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.plugin(paginate);
