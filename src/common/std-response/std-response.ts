import { Result } from '../result';
import { StdStatus } from './std-status';
import { genericCodeToStdStatus } from '../errors/generic-error';

export class StdResponse<T> {
  public status: string;
  public message: string;
  public data: T;

  constructor(data: T, message: string, status: string) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static fromResult<T>(result: Result<T>): StdResponse<T> {
    if (result.isOk()) {
      return new StdResponse<T>(result.value, '', StdStatus.Success);
    }

    return new StdResponse<T>(
      result.err.data,
      result.err.message,
      genericCodeToStdStatus(result.err.code),
    );
  }
}
