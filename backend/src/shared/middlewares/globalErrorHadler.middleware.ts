import { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "@/shared/utils/ApiError.js";
import { ErrorCodeEnum } from "@/shared/utils/ErrorCodeEnum.js";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import logger from "@/config/logger.config.js";

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  logger.error({
    message: error instanceof Error ? error.message : "Unknown error",
    path: req.path,
    method: req.method,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Zod Error
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Validation failed",
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
      details: formattedErrors,
    });
    return;
  }

  // AppError
  if (error instanceof ApiError) {
    console.log(error);
    res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
      details: error.details ?? null,
    });
    return;
  }

  // Unknown Error
  res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    errorCode: ErrorCodeEnum.INTERNAL_SERVER_ERROR,
    details: error instanceof Error ? error.message : "Unknown error",
  });
};
