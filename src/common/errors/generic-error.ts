import { StdStatus } from '../std-response/std-status';

export enum GenericErrorCode {
  INTERNAL = 1,
  NOT_FOUND = 2,
  INVALID_ARGUMENT = 3,
  FORBIDDEN = 4,
  UNAUTHORIZED = 5,
}

export function genericCodeToHttpStatus(code: GenericErrorCode): number {
  switch (code) {
    case GenericErrorCode.INTERNAL:
      return 500;
    case GenericErrorCode.NOT_FOUND:
      return 404;
    case GenericErrorCode.INVALID_ARGUMENT:
      return 400;
    case GenericErrorCode.FORBIDDEN:
      return 403;
    case GenericErrorCode.UNAUTHORIZED:
      return 401;
  }

  return 500;
}

export function genericCodeToStdStatus(code: GenericErrorCode): StdStatus {
  switch (code) {
    case GenericErrorCode.NOT_FOUND:
      return StdStatus.NotFound;
    case GenericErrorCode.INVALID_ARGUMENT:
      return StdStatus.BadRequest;
    case GenericErrorCode.FORBIDDEN:
      return StdStatus.PermissionDenied;
    case GenericErrorCode.UNAUTHORIZED:
      return StdStatus.UNAUTHORIZED;
    default:
      return StdStatus.InternalError;
  }
}

export class GenericError {
  code: GenericErrorCode;
  message: string;
  err: Error;
  data: any;

  constructor(err: Error | any, code?: GenericErrorCode, data?: any) {
    if (err instanceof Error) {
      this.err = err;
      this.message = err.message;
    } else {
      this.message = err;
      this.err = err;
    }
    this.data = data;
    this.code = code || GenericErrorCode.INTERNAL;
  }
}
