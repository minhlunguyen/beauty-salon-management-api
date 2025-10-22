import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'TimeShiftUnique', async: true })
@Injectable()
export class TimeShiftUniqueRule implements ValidatorConstraintInterface {
  constructor(private configService: ConfigService) {}

  async validate<Input extends { startTime: Date; endTime: Date }>(
    values: Array<Input> | undefined,
  ) {
    const timeShift = [];
    if (!values) {
      return true;
    }

    for (const item of values) {
      if (item.endTime.getTime() <= item.startTime.getTime()) {
        return false;
      }

      for (const shift of timeShift) {
        if (
          item.startTime.getTime() <= shift.endTime.getTime() &&
          item.endTime.getTime() >= shift.startTime.getTime()
        ) {
          return false;
        }
      }

      timeShift.push(item);
    }

    return true;
  }

  defaultMessage() {
    return `Time shift is invalid`;
  }
}

export function TimeShiftUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'TimeShiftUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: TimeShiftUniqueRule,
    });
  };
}
