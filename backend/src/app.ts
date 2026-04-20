import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import { corsConfig } from "./config/cors.config.js";
import { stream } from "./config/logger.config.js";
import { requestIdMiddleware } from "@/shared/middlewares/requestId.middleware.js";
import { globalErrorHandler } from "@/shared/middlewares/globalErrorHadler.middleware.js";
import { HTTPSTATUS } from "./shared/utils/HttpStatusCode.js";
import { sendResponse } from "./shared/utils/sendResponse.js";
import envConfig from "./config/env.config.js";
import apiRoutes from "@/routes/index.js";
import { globalRateLimiter } from "./shared/lib/rateLimiter.lib.js";

const app = express();

// Middlewares
app.use(requestIdMiddleware);

app.use(cors(corsConfig));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(helmet());

app.use(morgan("combined", { stream }));

// Health route
app.get("/health", (req: Request, res: Response) => {
  const response: {
    status: string;
    timestamp: string;
    mongodb?: {
      status: string;
      host?: string;
      name?: string;
    };
  } = {
    status: "OK",
    timestamp: new Date().toISOString(),
  };

  if (envConfig.NODE_ENV === "development") {
    const dbStatus: number = mongoose.connection.readyState;

    const statusMap = [
      "disconnected",
      "connected",
      "connecting",
      "disconnecting",
    ] as const;

    response.mongodb = {
      status: statusMap[dbStatus] ?? "unknown",
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
  sendResponse(res, HTTPSTATUS.OK, response, "API is live");
});

// Routes
app.use("/api", apiRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
