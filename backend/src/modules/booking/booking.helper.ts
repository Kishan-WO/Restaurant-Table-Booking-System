import { BOOKING_KEYS } from "./booking.cache.js";
import redis from "@/config/redis.config.js";
import type { ITable } from "../table/table.model.js";
import type mongoose from "mongoose";

type LeanTable = Omit<ITable, "_id"> & {
  _id: mongoose.Types.ObjectId;
};

export const getAvailableTables = async (
  tables: LeanTable[],
  startTime: Date,
): Promise<LeanTable[]> => {
  const pipeline = redis.multi();

  tables.forEach((table) => {
    const key = BOOKING_KEYS.lock(
      table._id.toString(),
      startTime.toISOString(),
    );
    pipeline.exists(key);
  });

  const results = await pipeline.exec();

  return tables.filter((_table, index) => {
    const value = results?.[index];

    if (typeof value !== "number") {
      return false;
    }

    return value === 0;
  });
};

export const convertToDate = (startTime: Date, slotDuration: number) => {
  const requestedStartTime = new Date(startTime);
  const slotDurationMs = slotDuration * 60 * 1000;
  const requestedEndTime = new Date(
    requestedStartTime.getTime() + slotDurationMs,
  );

  return { requestedStartTime, requestedEndTime };
};
