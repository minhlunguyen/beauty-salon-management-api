import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { nanoid } from 'nanoid/async';
import { FileRepository } from '@src/media/repositories/file.repository';
import { statuses } from '@src/media/models/file.model';

export interface SignedUrl {
  isPublic: boolean;
  fileName: string;
  contentType: string;
  group?: string;
}

@Injectable()
export class S3Service {
  constructor(
    @InjectS3() private readonly s3: S3,
    private fileRepository: FileRepository,
  ) {}

  public async createSignedUrlForPuttingObject(data: Array<SignedUrl>) {
    const result = await this.getSignedUrls(data);
    await this.fileRepository.model.insertMany(result);
    return result;
  }

  private async getSignedUrls(data: Array<SignedUrl>) {
    const signedUrls = data.map(async (item) => {
      const id = await nanoid();
      const acl = item.isPublic ? 'public-read' : 'private';
      const fileName = item.fileName
        .replace(/^.*[\\\/]/, '')
        .replace(/\s/g, '');
      const group = item.group ? item.group : 'images';
      const key = `${group}/${acl}-${id}-${fileName}`;

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        ACL: acl,
        ContentType: item.contentType,
      };
      const result = await this.s3.getSignedUrlPromise('putObject', params);
      return {
        url: result,
        key,
        isPublic: item.isPublic,
        contentType: item.contentType,
        status: statuses.DRAFT,
        originalName: item.fileName,
      };
    });
    return await Promise.all(signedUrls);
  }

  public getPublicUrlInS3(fileName) {
    const prefixUrl = `https://${process.env.AWS_BUCKET}.s3.amazonaws.com`;
    const regex = new RegExp(`^${prefixUrl}`, 'g');
    if (!regex.test(fileName)) {
      return `${prefixUrl}/${fileName}`;
    }
    return fileName;
  }

  public getSignedUrlForGet(key) {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Expires: 60 * 15,
    };
    return this.s3.getSignedUrlPromise('getObject', params);
  }
}
