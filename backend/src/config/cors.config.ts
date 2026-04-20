import type { CorsOptions } from 'cors'
import envConfig from './env.config.js'
import { logger } from './logger.config.js';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = [envConfig.CLIENT_ORIGIN];

    if (envConfig.NODE_ENV === "development" || !origin || whitelist.includes(origin)) {
      callback(null, true);
      return;
    }

    const message = `CORS error: ${origin} is not allowed by CORS`;

    logger.warn(message);

    callback(new Error(message), false);
    return;
  },

  credentials: true,
};