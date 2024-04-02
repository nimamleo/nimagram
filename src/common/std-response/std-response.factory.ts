import { StdResponse } from './std-response';
import { StdStatus } from './std-status';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class StdResponseFactory {
  public static Base<T>(
    data: T = null,
    message = '',
    status: string,
  ): StdResponse<T> {
    return new StdResponse<T>(data, message, status);
  }

  public static Ok<T>(data: T = null, message = ''): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.Success);
  }

  public static OkMsg<T>(message = ''): StdResponse<T> {
    return this.Ok<T>(null, message);
  }

  public static BadRequest<T>(data: T = null, message = ''): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.BadRequest);
  }

  public static BadRequestMsg<T>(message = ''): StdResponse<T> {
    return this.BadRequest<T>(null, message);
  }

  public static BadRequestStdException<T>(message = ''): HttpException {
    return new BadRequestException(this.BadRequestMsg<T>(message));
  }

  public static NotFound<T>(data: T = null, message = ''): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.NotFound);
  }

  public static NotFoundMsg<T>(message = ''): StdResponse<T> {
    return this.NotFound<T>(null, message);
  }

  public static NotFoundStdException<T>(message = ''): HttpException {
    return new NotFoundException(this.NotFoundMsg<T>(message));
  }

  public static UnAuthorized<T>(data: T = null, message = ''): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.UNAUTHORIZED);
  }

  public static UnAuthorizedMsg<T>(message = ''): StdResponse<T> {
    return this.UnAuthorized<T>(null, message);
  }

  public static NotAuthStdException<T>(message = ''): HttpException {
    return new UnauthorizedException(this.UnAuthorizedMsg<T>(message));
  }

  public static PermissionDenied<T>(
    data: T = null,
    message = '',
  ): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.PermissionDenied);
  }

  public static PermissionDeniedMsg<T>(message = ''): StdResponse<T> {
    return this.PermissionDenied<T>(null, message);
  }

  public static PermissionDeniedStdException<T>(message = ''): HttpException {
    return new ForbiddenException(this.PermissionDeniedMsg<T>(message));
  }

  public static InternalError<T>(data: T = null, message = ''): StdResponse<T> {
    return this.Base<T>(data, message, StdStatus.InternalError);
  }

  public static InternalErrorMsg<T>(message = ''): StdResponse<T> {
    return this.InternalError<T>(null, message);
  }

  public static InternalErrorStdException<T>(message = ''): HttpException {
    return new InternalServerErrorException(this.InternalErrorMsg<T>(message));
  }
}
