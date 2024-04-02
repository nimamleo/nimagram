import { validate } from 'class-validator';
import { ValidationError } from 'class-validator/types/validation/ValidationError';
import { ValidationFailure } from './validation-failure';
import { plainToInstance } from 'class-transformer';
import { Err, Ok, Result } from '../result';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';
import { GenericErrorCode } from '../errors/generic-error';

export class Validator {
  private readonly failures: ValidationFailure[];
  private readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    this.errors = errors;
    this.failures = [];
    for (const failures of errors) {
      this.updateFailures(failures, '');
    }
  }

  private updateFailures(error: ValidationError, propName: string) {
    if (error.constraints) {
      for (const failure of Object.values(error.constraints)) {
        this.failures.push(
          new ValidationFailure(`${propName}${error.property}`, failure),
        );
      }
    }
    if (error.children) {
      for (const subError of error.children) {
        this.updateFailures(subError, error.property + '.');
      }
    }
  }

  static async validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ): Promise<Validator> {
    return new Validator(await validate(object, validatorOptions));
  }

  static async validateObject(
    object: object,
    type: any,
    validatorOptions?: ValidatorOptions,
  ): Promise<Validator> {
    return new Validator(
      await validate(plainToInstance(type, object), validatorOptions),
    );
  }

  public toResult(): Result<any> {
    if (!this.failed()) {
      return Ok(true);
    }
    return Err(
      new Error('Validation error'),
      GenericErrorCode.INVALID_ARGUMENT,
      this.getMessage(),
    );
  }

  public failed() {
    return this.failures.length !== 0;
  }

  public getErrors() {
    return this.errors;
  }

  public getMessage() {
    return this.failures;
  }
}
