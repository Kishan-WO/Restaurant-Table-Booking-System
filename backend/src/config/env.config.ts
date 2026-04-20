import dotenv from "dotenv";
import { z } from "zod";
import { type SignOptions } from "jsonwebtoken";
import logger from "./logger.config.js";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),

  NODE_ENV: z.enum(["development", "production"]).default("development"),

  MONGO_URI: z.string(),

  DB_NAME: z.string(),

  CLIENT_ORIGIN: z.string(),

  JWT_ACCESS_SECRET: z.string(),

  JWT_ACCESS_EXPIRES_IN: z.string().default("1d") as z.ZodType<
    SignOptions["expiresIn"]
  >,

  JWT_REFRESH_SECRET: z.string(),

  JWT_REFRESH_EXPIRES_IN: z.string().default("7d") as z.ZodType<
    SignOptions["expiresIn"]
  >,

  REDIS_URL: z.string(),
});

type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error: unknown) {
  if (error instanceof z.ZodError) {
    logger.error("Invalid environment variables");
    logger.error(JSON.stringify(z.treeifyError(error), null, 2));
  } else if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error("Unknown error while parsing environment variables", {
      error,
    });
  }

  process.exit(1);
}

export default envConfig;
export type { EnvConfig };
