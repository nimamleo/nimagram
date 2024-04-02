import { GenericError, GenericErrorCode } from './errors/generic-error';

export class Result<T> {
  get value(): T {
    if (this.isError()) {
      throw this._err.err;
    }
    return this._value;
  }

  get err(): GenericError {
    if (this.isOk()) {
      throw new GenericError(
        `Result has value: ${this._value}`,
        GenericErrorCode.INTERNAL,
      );
    }
    return this._err;
  }

  constructor(private readonly _value: T, private readonly _err: GenericError) {
    if (this.isError() && this.isOk()) {
      this._value = null;
    }
    if (!this.isError() && !this.isOk()) {
      this._err = new GenericError('Unknown error', GenericErrorCode.INTERNAL);
    }
  }

  public isOk(): boolean {
    return this._value !== undefined && this._value !== null;
  }

  public isError(): boolean {
    return !!this._err;
  }
}

export function Ok<T>(v: T): Result<T> {
  return new Result<T>(v, null);
}

export function Err(
  e: Error | string | GenericError,
  code?: GenericErrorCode,
  data?: any,
): Result<any> {
  if (e instanceof String || typeof e === 'string') {
    return new Result<any>(
      null,
      new GenericError(new Error(e as string), code, data),
    );
  }
  if (e instanceof GenericError) {
    return new Result<any>(null, e);
  }

  return new Result<any>(null, new GenericError(e, code, data));
}
