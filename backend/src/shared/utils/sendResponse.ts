import { type Response } from "express";
import { ApiResponse } from "./ApiResponse.js";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message = "Success",
  meta?: Record<string, unknown>,
) => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message, meta));
};
