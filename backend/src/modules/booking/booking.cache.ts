import crypto from "crypto";
import redis from "@/config/redis.config.js";
import { getRequestId } from "@/shared/context/requestContext.js";

// ================= TYPES =================

type TableId = string;
type ISODateString = string;

// ================= KEYS =================

export const BOOKING_KEYS = {
  lock: (tableId: TableId, startTime: ISODateString): string => {
    const timestamp = new Date(startTime).getTime();
    return `lock:table:${tableId}:slot:${timestamp}`;
  },
};

// ================= TTLS =================

export const BOOKING_TTLS = {
  lock: 5 * 60, // 5 minutes
};

// ================= LOCK HELPERS =================

export const acquireBookingLock = async (
  tableId: TableId,
  startTime: ISODateString,
): Promise<string | null> => {
  const key = BOOKING_KEYS.lock(tableId, startTime);
  const value = `${crypto.randomUUID()}:${getRequestId()}`;
  const ttl = BOOKING_TTLS.lock;

  const result = await redis.set(key, value, {
    NX: true,
    EX: ttl,
  });

  if (result === "OK") {
    return value;
  }

  return null;
};

export const releaseBookingLock = async (
  tableId: TableId,
  startTime: ISODateString,
  lockValue: string,
): Promise<number> => {
  const key = BOOKING_KEYS.lock(tableId, startTime);

  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redis.eval(luaScript, {
    keys: [key],
    arguments: [lockValue],
  });

  return result as number;
};
