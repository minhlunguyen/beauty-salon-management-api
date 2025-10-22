import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'WeekDayUnique', async: true })
@Injectable()
export class WeekDayUniqueRule implements ValidatorConstraintInterface {
  constructor(private configService: ConfigService) {}

  async validate(values: Array<any> | undefined) {
    const existDay = [];
    if (!values) {
      return true;
    }

    for (const item of values) {
      if (existDay.includes(item.weekDay)) {
        return false;
      }
      existDay.push(item.weekDay);
    }

    if (existDay.length !== 7) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Weekday is invalid`;
  }
}

export function WeekDayUnique(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'WeekDayUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: WeekDayUniqueRule,
    });
  };
}
