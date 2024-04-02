import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { isAsyncFunction } from 'util/types';

@ValidatorConstraint({ name: 'MustSync', async: false })
@Injectable()
export class MustRule implements ValidatorConstraintInterface {
  constructor(private moduleRef: ModuleRef) {
    //
  }

  hasWhenFunction(data: ValidationArguments): boolean {
    return !!data.constraints[1] && typeof data.constraints[1] === 'function';
  }

  runWhenFunction(value: any, data: ValidationArguments): boolean {
    return data.constraints[1](value, data.object, this.moduleRef);
  }

  validate(value: any, data: ValidationArguments) {
    if (this.hasWhenFunction(data) && isAsyncFunction(data.constraints[1])) {
      throw new Error(`Can't use async function in sync validator.`);
    }
    try {
      if (this.hasWhenFunction(data)) {
        if (this.runWhenFunction(value, data)) {
          return data.constraints[0](value, data.object, this.moduleRef);
        }
        return true;
      }
      return data.constraints[0](value, data.object, this.moduleRef);
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `MustSync rule failed`;
  }
}

export function Must(
  rule: (property: any, object: any, moduleRef: ModuleRef) => boolean,
  when: (property: any, object: any, moduleRef: ModuleRef) => boolean = () =>
    true,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'mustSync',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [rule, when],
      options: validationOptions,
      validator: MustRule,
    });
  };
}

export function NotNull(property: any): boolean {
  return property !== undefined && property !== null;
}

export function NotEmptyString(property: string): boolean {
  return !!property;
}
