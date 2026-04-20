import bcrypt from "bcryptjs";
import type { Response } from "express";
import logger from "@/config/logger.config.js";
import {
  clearRefreshToken,
  createUser,
  findUserWithPasswordByEmail,
  findUserWithRefreshHash,
  saveRefreshTokenHash,
} from "@/modules/user/user.dao.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "@/shared/utils/ApiError.js";
import {
  clearAuthCookies,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  verifyRefreshToken,
} from "./auth.helper.js";
import { delay } from "@/shared/utils/delay.js";

// ================= REGISTER =================

export const registerService = async (input: RegisterInput) => {
  logger.info("Registering new user", { email: input.email });

  const existing = await findUserWithPasswordByEmail(input.email);
  if (existing) {
    throw new ConflictException("Email already registered");
  }

  const user = await createUser(input);

  logger.info("User registered successfully", { userId: user._id });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

// ================= LOGIN =================

export const loginService = async (input: LoginInput, res: Response) => {
  logger.info("User login attempt", { email: input.email });

  const user = await findUserWithPasswordByEmail(input.email);
  if (!user) {
    throw new UnauthorizedException("Invalid email or password");
  }

  const isMatch = await user.comparePassword(input.password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  const userId = user._id.toString();
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const refreshHash = await bcrypt.hash(refreshToken, 10);
  await saveRefreshTokenHash(userId, refreshHash);

  setAuthCookies(res, accessToken, refreshToken);

  logger.info("User logged in successfully", { userId });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken,
    refreshToken,
  };
};

// ================= REFRESH TOKEN =================

export const refreshTokenService = async (
  incomingRefreshToken: string,
  res: Response,
) => {
  logger.info("Token refresh attempt");

  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  const user = await findUserWithRefreshHash(payload.userId);
  if (!user || !user.refreshTokenHash) {
    throw new UnauthorizedException("Refresh token not found");
  }

  const isValid = await bcrypt.compare(
    incomingRefreshToken,
    user.refreshTokenHash,
  );

  if (!isValid) {
    await clearRefreshToken(payload.userId);
    throw new UnauthorizedException(
      "Refresh token reuse detected. Please login again.",
    );
  }

  const userId = user._id.toString();
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  const newHash = await bcrypt.hash(newRefreshToken, 10);
  await saveRefreshTokenHash(userId, newHash);

  setAuthCookies(res, newAccessToken, newRefreshToken);

  logger.info("Tokens rotated successfully", { userId });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// ================= LOGOUT =================

export const logoutService = async (userId: string, res: Response) => {
  logger.info("User logout", { userId });

  await clearRefreshToken(userId);
  clearAuthCookies(res);

  logger.info("User logged out successfully", { userId });
};
