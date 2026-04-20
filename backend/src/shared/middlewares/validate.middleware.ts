import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ApiError } from "@/shared/utils/ApiError.js";
import { ErrorCodeEnum } from "@/shared/utils/ErrorCodeEnum.js";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";

interface Schema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

interface ValidationError {
  path: string;
  message: string;
}

export const validateMiddleware =
  (schema: Schema) => (req: Request, _res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            path: `body.${issue.path.join(".") || "root"}`,
            message: issue.message,
          })),
        );
      } else {
        console.log(req.body, result.data);
        (req as unknown as { body: unknown }).body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            path: `query.${issue.path.join(".") || "root"}`,
            message: issue.message,
          })),
        );
      } else {
        Object.assign(req.query, result.data);
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);

      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            path: `params.${issue.path.join(".") || "root"}`,
            message: issue.message,
          })),
        );
      } else {
        Object.assign(req.params, result.data);
      }
    }

    if (errors.length > 0) {
      next(
        new ApiError(
          "Validation failed",
          HTTPSTATUS.BAD_REQUEST,
          ErrorCodeEnum.VALIDATION_ERROR,
          errors,
        ),
      );
      return;
    }

    next();
  };
