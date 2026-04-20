import fs from "fs";
import path from "path";
import winston from "winston";
import { getRequestId } from "@/shared/context/requestContext.js";

const { createLogger, transports, format } = winston;

const env: string = "development";

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevel = env === "production" ? "info" : "debug";

const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({
      format: "DD-MM-YYYY hh:mm:ss A",
    }),
    format.errors({ stack: true }),
    format.printf((info) => {
      const { timestamp, level, message, stack } = info;

      const requestId = getRequestId();
      const rid = requestId ? `[${requestId}] ` : "";

      return stack
        ? `${timestamp} - ${level}: ${rid}${stack}`
        : `${timestamp} - ${level}: ${rid}${message}`;
    }),
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: path.join(logDir, "app.log"),
      maxsize: 5 * 1024 * 1024,
    }),
  ],
  exitOnError: false,
});

const stream = {
  write(message: string) {
    const requestId = getRequestId();
    logger.info(`[${requestId}] ${message.trim()}`);
  },
};

export { logger, stream };
export default logger;
