import { Err } from '../result';
import { Logger } from '@nestjs/common';

const errorLogger = new Logger('HandleError');

export function HandleError(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      if (typeof error === 'string') {
        error = new Error(error);
      }
      errorLogger.error(
        `Error in ${_methodName}@${_target.constructor.name}: ${error.name} ${error.message}`,
        error.stack,
        _target.constructor.name,
      );

      return Err(error);
    }
  };
}
