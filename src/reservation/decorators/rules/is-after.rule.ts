import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsTimeAfter', async: true })
@Injectable()
export class IsTimeAfterRule implements ValidatorConstraintInterface {
  async validate(value: Date | undefined, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue: Date = (args.object as any)[relatedPropertyName];
    if (!relatedValue) {
      return true;
    }
    return relatedValue.getTime() < value.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return `The ${args.property} must after the ${args.constraints[0]}`;
  }
}

export function IsTimeAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsTimeAfter',
      target: object.constructor,
      constraints: [property],
      propertyName: propertyName,
      options: validationOptions,
      validator: IsTimeAfterRule,
    });
  };
}
