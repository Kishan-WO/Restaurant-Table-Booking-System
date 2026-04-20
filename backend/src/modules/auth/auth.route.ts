import { Router } from "express";
import { validateMiddleware } from "@/shared/middlewares/validate.middleware.js";
import {
  loginController,
  logoutController,
  rateTestController,
  refreshTokenController,
  registerController,
} from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { authenticateMiddleware } from "@/shared/middlewares/authenticate.middleware.js";
import { authRateLimiter } from "@/shared/lib/rateLimiter.lib.js";

const router = Router();

router.get("/auth/rate-test", rateTestController);

// ================= PUBLIC =================

router.post(
  "/register",
  validateMiddleware(registerSchema),
  registerController,
);

router.post("/login", validateMiddleware(loginSchema), loginController);

router.post("/refresh", refreshTokenController);

// ================= PROTECTED =================

router.post("/logout", authenticateMiddleware, logoutController);

export default router;
