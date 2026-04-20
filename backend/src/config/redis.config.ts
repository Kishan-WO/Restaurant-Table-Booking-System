import { createClient, type RedisClientType } from "redis";
import logger from "./logger.config.js";
import envConfig from "./env.config.js";

const REDIS_URL = envConfig.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined");
}

const redisClient: RedisClientType = createClient({
  url: REDIS_URL,
  socket: {
    connectTimeout: 10_000,
    reconnectStrategy: (retries: number): number | Error => {
      if (retries > 10) return new Error("Too many retries");
      return Math.min(retries * 100, 3000);
    },
  },
  disableOfflineQueue: false,
});

// Typed event handlers
redisClient.on("error", (err: Error) => logger.error("Redis error:", err));
redisClient.on("connect", () => logger.info("Redis connected"));
redisClient.on("reconnecting", () => logger.info("Redis reconnecting..."));
redisClient.on("ready", () => logger.info("Redis ready"));

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    logger.info("Redis Disconnected");
  }
};

export default redisClient;
