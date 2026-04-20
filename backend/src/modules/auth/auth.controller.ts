import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import {
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
} from "./auth.service.js";
import { sendResponse } from "@/shared/utils/sendResponse.js";
import { UnauthorizedException } from "@/shared/utils/ApiError.js";

export const rateTestController = async (req: Request, res: Response) => {
  sendResponse(res, HTTPSTATUS.OK, { success: true }, "ok");
};

// ================= REGISTER =================

export const registerController = async (req: Request, res: Response) => {
  const user = await registerService(req.body as RegisterInput);
  sendResponse(res, HTTPSTATUS.CREATED, user, "User registered successfully");
};

// ================= LOGIN =================

export const loginController = async (req: Request, res: Response) => {
  const result = await loginService(req.body as LoginInput, res);
  sendResponse(res, HTTPSTATUS.OK, result, "Login successful");
};

// ================= REFRESH TOKEN =================

export const refreshTokenController = async (req: Request, res: Response) => {
  const incomingToken =
    (req.cookies?.refreshToken as string | undefined) ||
    (req.body?.refreshToken as string | undefined);

  if (!incomingToken) {
    throw new UnauthorizedException("Refresh token not provided");
  }

  const tokens = await refreshTokenService(incomingToken, res);
  sendResponse(res, HTTPSTATUS.OK, tokens, "Tokens refreshed successfully");
};

// ================= LOGOUT =================

export const logoutController = async (req: Request, res: Response) => {
  const userId = req.user!._id.toString();
  await logoutService(userId, res);
  sendResponse(res, HTTPSTATUS.OK, null, "Logged out successfully");
};
