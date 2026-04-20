/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { randomUUID } from "crypto";
import { type Request, type Response, type NextFunction } from "express";
import { asyncLocalStorage } from "@/shared/context/requestContext.js";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Honor upstream IDs (API gateway, load balancer)
  const requestId =
    (req.headers["x-request-id"] as string) ??
    (req.headers["x-correlation-id"] as string) ??
    randomUUID();

  res.setHeader("x-request-id", requestId);

  asyncLocalStorage.run({ requestId }, () => {
    next();
  });
}
