import AbstractRepository from '@src/common/abstracts/repository.abstract';
import { PaginateModel, QueryOptions } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File, FileDocument, statuses } from '@src/media/models/file.model';
import { difference as _difference } from 'lodash';

@Injectable()
export class FileRepository extends AbstractRepository<FileDocument> {
  constructor(@InjectModel(File.name) model: PaginateModel<FileDocument>) {
    super(model);
  }

  public async getFileByKeys({ keys }) {
    return this.find({
      conditions: {
        key: { $in: keys },
      },
    });
  }

  public async updateFileStatus(
    newKeys: string[],
    oldKeys?: string[] | undefined,
    options?: QueryOptions | undefined,
  ): Promise<boolean> {
    const newFiles = _difference(newKeys, oldKeys || []);
    let deleteFiles = [];
    if (oldKeys) {
      deleteFiles = _difference(oldKeys, newKeys);
    }

    if (deleteFiles.length) {
      await this.findOneAndUpdate(
        { key: { $in: deleteFiles } },
        { status: statuses.DELETED },
        options,
      );
    }

    if (newFiles.length) {
      await this.findOneAndUpdate(
        { key: { $in: newFiles } },
        { status: statuses.USED },
        options,
      );
    }

    return true;
  }
}
