import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@ValidatorConstraint({ name: 'Must', async: true })
@Injectable()
export class MustAsyncRule implements ValidatorConstraintInterface {
  constructor(private moduleRef: ModuleRef) {
    //
  }

  hasWhenFunction(data: ValidationArguments): boolean {
    return !!data.constraints[1] && typeof data.constraints[1] === 'function';
  }

  async runWhenFunction(
    value: any,
    data: ValidationArguments,
  ): Promise<boolean> {
    return await data.constraints[1](value, data.object, this.moduleRef);
  }

  async validate(value: any, data: ValidationArguments) {
    try {
      if (this.hasWhenFunction(data)) {
        if (await this.runWhenFunction(value, data)) {
          return await data.constraints[0](value, data.object, this.moduleRef);
        }
        return true;
      }
      return await data.constraints[0](value, data.object, this.moduleRef);
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Must rule failed`;
  }
}

export function MustAsync(
  rule: (property: any, object: any, moduleRef: ModuleRef) => Promise<boolean>,
  when: (
    property: any,
    object: any,
    moduleRef: ModuleRef,
  ) => Promise<boolean> = async () => true,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'must',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [rule, when],
      options: validationOptions,
      validator: MustAsyncRule,
    });
  };
}

export async function NotNullAsync(property: any): Promise<boolean> {
  return property !== undefined && property !== null;
}
