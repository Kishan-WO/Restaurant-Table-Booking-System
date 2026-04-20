import sanitizeHtml, { type IOptions as SanitizeOptions } from "sanitize-html";
import { type Request, type Response, type NextFunction } from "express";
import { InternalServerException } from "@/shared/utils/ApiError.js";
import logger from "@/config/logger.config.js";

// Generic type for nested values
type Sanitizable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Sanitizable[]
  | { [key: string]: Sanitizable };

// Strips ALL HTML
export const PLAIN_TEXT_OPTIONS: SanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

// Allows basic formatting
export const RICH_TEXT_OPTIONS: SanitizeOptions = {
  allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

function sanitizeValue(
  value: Sanitizable,
  options: SanitizeOptions,
): Sanitizable {
  if (typeof value === "string") {
    return sanitizeHtml(value.trim(), options);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, options));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        sanitizeValue(v as Sanitizable, options),
      ]),
    );
  }

  return value;
}

type FieldOptions = Record<string, SanitizeOptions>;

interface MiddlewareOptions {
  body?: FieldOptions;
  query?: FieldOptions;
  params?: FieldOptions;
}

export const sanitizeMiddleware = (options: MiddlewareOptions = {}) => {
  const { body = {}, query = {}, params = {} } = options;

  [
    ["body", body],
    ["query", query],
    ["params", params],
  ].forEach(([part, fields]) => {
    if (typeof fields !== "object" || Array.isArray(fields)) {
      logger.error(
        `sanitizeMiddleware: "${part}" must be a plain object of { fieldName: sanitizeHtmlOptions }`,
      );
      throw new InternalServerException();
    }
  });

  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      Object.entries(body).forEach(([field, fieldOpts]) => {
        if (req.body?.[field] !== undefined) {
          req.body[field] = sanitizeValue(req.body[field], fieldOpts) as any;
        }
      });

      Object.entries(query).forEach(([field, fieldOpts]) => {
        if (req.query?.[field] !== undefined) {
          req.query[field] = sanitizeValue(req.query[field], fieldOpts) as any;
        }
      });

      Object.entries(params).forEach(([field, fieldOpts]) => {
        if (req.params?.[field] !== undefined) {
          req.params[field] = sanitizeValue(
            req.params[field],
            fieldOpts,
          ) as any;
        }
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};
