import type { Response } from "express";
import jwt from "jsonwebtoken";
import envConfig from "@/config/env.config.js";

// ==================== GENERATE TOKENS ====================

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, envConfig.JWT_ACCESS_SECRET, {
    expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN!,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, envConfig.JWT_REFRESH_SECRET, {
    expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN!,
  });
};

// ==================== VERIFY TOKENS ====================

interface JwtPayload {
  userId: string;
}

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as JwtPayload;
};

// ==================== SET COOKIES ====================

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProd = envConfig.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 DAY
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 DAYS
  });
};

// ==================== CLEAR COOKIES ====================

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
