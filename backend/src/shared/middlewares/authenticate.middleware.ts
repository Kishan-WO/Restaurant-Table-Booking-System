import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import envConfig from "@/config/env.config.js";
import UserModel from "@/modules/user/user.model.js";
import { UnauthorizedException } from "@/shared/utils/ApiError.js";

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

const extractToken = (req: Request) => {
  const cookieToken = req.cookies.accessToken as string | undefined;

  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

export const authenticateMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (!token) {
    throw new UnauthorizedException("Authentication required");
  }

  let decoded: CustomJwtPayload;

  try {
    decoded = jwt.verify(
      token,
      envConfig.JWT_ACCESS_SECRET,
    ) as CustomJwtPayload;
  } catch {
    throw new UnauthorizedException("Invalid or expired token");
  }

  const user = await UserModel.findById(decoded.userId);

  if (!user) {
    throw new UnauthorizedException("User not found");
  }

  req.user = user;

  next();
};
