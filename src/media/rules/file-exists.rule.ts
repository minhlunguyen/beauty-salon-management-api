import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  // ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectS3, S3 } from 'nestjs-s3';
import { AppLogger } from '@src/common/services/app-logger.service';

@ValidatorConstraint({ name: 'FileExists', async: true })
@Injectable()
export class FileExistsRule implements ValidatorConstraintInterface {
  constructor(
    @InjectS3() private readonly s3: S3,
    private appLogger: AppLogger,
  ) {}

  async validate(values: string | Array<string>) {
    if (!values) {
      return true;
    }
    if (typeof values === 'string') {
      values = [values];
    }
    const s3 = this.s3;
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      try {
        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: value,
        };
        await new Promise((resolve, reject) => {
          s3.headObject(params, function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(params.Key);
            }
          });
        });
        return true;
      } catch (e) {
        this.appLogger.error(e.message, e.stack);
        return false;
      }
    }
  }

  defaultMessage() {
    return `File doesn't exist`;
  }
}

export function FileExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'FileExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: FileExistsRule,
    });
  };
}
