import mongoose from "mongoose";
import envConfig from "./env.config.js";
import logger from "./logger.config.js";

export const connectDb = async () => {
  try {
    const mongoDbConnection = await mongoose.connect(envConfig.MONGO_URI, {
      dbName: envConfig.DB_NAME,
    });

    logger.info(`Database Connected : ${mongoDbConnection.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Database Connection Error : ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("Database Connection Error : Unknown error", { error });
    }
  }
};

export const disconnectDb = async () => {
  try {
    await mongoose.disconnect();
    logger.info(`Database Disconnected`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Database Disconnection Error : ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("Database Disconnection Error : Unknown error", { error });
    }
  }
};
