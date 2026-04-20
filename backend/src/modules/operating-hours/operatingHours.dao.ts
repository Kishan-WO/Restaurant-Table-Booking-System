import mongoose, { Types } from "mongoose";
import type { WeekDay } from "@/shared/constants/index.js";
import OperatingHoursModel from "./operatingHours.model.js";
import type { UpsertOperatingHoursInput } from "./operatingHours.schema.js";

// ================= FIND ALL BY RESTAURANT =================

export const findOperatingHoursByRestaurantId = (restaurantId: string) => {
  return OperatingHoursModel.find({ restaurantId }).select("-__v").lean();
};

// ================= FIND ONE BY RESTAURANT + DAY =================

export const findOperatingHoursByDay = (restaurantId: string, day: WeekDay) => {
  return OperatingHoursModel.findOne({ restaurantId, day })
    .select("-__v")
    .lean();
};

// ================= BULK UPSERT (ALL 7 DAYS) =================

export const bulkUpsertOperatingHours = (
  restaurantId: string,
  days: Record<WeekDay, UpsertOperatingHoursInput>,
) => {
  const resId = new mongoose.Types.ObjectId(restaurantId);
  const ops = (
    Object.entries(days) as [WeekDay, UpsertOperatingHoursInput][]
  ).map(([day, data]) => ({
    updateOne: {
      filter: { restaurantId: resId, day },
      update: { $set: { ...data, restaurantId: resId, day } },
      upsert: true,
    },
  }));

  return OperatingHoursModel.bulkWrite(ops);
};

// ================= DELETE ALL BY RESTAURANT =================

export const deleteOperatingHoursByRestaurantId = (restaurantId: string) => {
  return OperatingHoursModel.deleteMany({ restaurantId });
};
