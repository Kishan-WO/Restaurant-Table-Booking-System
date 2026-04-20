import type { Request, Response, NextFunction } from "express";
import {
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from "@/shared/utils/ApiError.js";
import logger from "@/config/logger.config.js";
import { findUserById } from "@/modules/user/user.dao.js";
import { type UserRole } from "@/shared/constants/index.js";

const authorizeMiddleware = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id.toString();
    if (!userId) throw new NotFoundException("User Not Found");

    try {
      const user = await findUserById(userId);

      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      if (!roles.includes(user.role)) {
        throw new ForbiddenException(
          "You do not have permission to access this resource",
        );
      }

      return next();
    } catch (err) {
      logger.error("Error while authorizing user", err);
      next(err);
    }
  };
};

export default authorizeMiddleware;
