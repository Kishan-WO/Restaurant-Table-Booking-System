import type { Server } from "node:http";
import app from "@/app.js";
import logger from "@/config/logger.config.js";
import { connectDb, disconnectDb } from "./config/db.config.js";
import envConfig from "./config/env.config.js";
import { connectRedis, disconnectRedis } from "./config/redis.config.js";

let server: Server;
const PORT = envConfig.PORT;

const startServer = async () => {
  try {
    await connectDb();
    await connectRedis();

    server = app.listen(PORT, (err) => {
      if (err) {
        logger.error(`Critical: Server failed to bind to port ${PORT}`, err);
        process.exit(1);
      }
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Server START Error: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("Server START Error: Unknown error", { error });
    }

    process.exit(1);
  }
};

const handleServerShutdown = async () => {
  try {
    logger.info("Server shutdown initiated...");

    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    logger.info("HTTP server closed");

    await disconnectDb();
    await disconnectRedis();

    process.exit(0);
  } catch (error) {
    logger.error("Server shutdown error", {
      err: error instanceof Error ? error : new Error(String(error)),
    });
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  handleServerShutdown();
});

process.on("SIGINT", () => {
  handleServerShutdown();
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

startServer();
