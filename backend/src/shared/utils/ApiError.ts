import { ErrorCodeEnum, type ErrorCodeEnumType } from "./ErrorCodeEnum.js";
import { HTTPSTATUS, type HttpStatusCodeType } from "./HttpStatusCode.js";

export class ApiError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCodeType = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCodeEnumType,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends ApiError {
  constructor(message = "Resource not found", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.NOT_FOUND,
      errorCode ?? ErrorCodeEnum.RESOURCE_NOT_FOUND,
    );
  }
}

export class BadRequestException extends ApiError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.BAD_REQUEST,
      errorCode ?? ErrorCodeEnum.INVALID_INPUT,
    );
  }
}

export class UnauthorizedException extends ApiError {
  constructor(
    message = "Unauthenticated Access",
    errorCode?: ErrorCodeEnumType,
  ) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      errorCode ?? ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends ApiError {
  constructor(message = "Unauthorized Access", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.FORBIDDEN,
      errorCode ?? ErrorCodeEnum.ACCESS_FORBIDDEN,
    );
  }
}

export class InternalServerException extends ApiError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType,
  ) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode ?? ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ConflictException extends ApiError {
  constructor(message = "Resource already exists", details?: unknown) {
    super(
      message,
      HTTPSTATUS.CONFLICT,
      ErrorCodeEnum.RESOURCE_CONFLICT_ERROR,
      details,
    );
  }
}
