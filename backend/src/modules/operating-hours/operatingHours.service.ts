import type { WeekDay } from "@/shared/constants/index.js";
import {
  ForbiddenException,
  NotFoundException,
} from "@/shared/utils/ApiError.js";
import { findRestaurantById } from "../restaurant/restaurant.dao.js";
import {
  bulkUpsertOperatingHours,
  deleteOperatingHoursByRestaurantId,
  findOperatingHoursByDay,
  findOperatingHoursByRestaurantId,
} from "./operatingHours.dao.js";
import type { BulkUpsertOperatingHoursInput } from "./operatingHours.schema.js";

// ================= GUARD: ( RESTAURANT CHECK + CALLER IS OWNER ) =================

const assertRestaurantOwner = async (restaurantId: string, userId: string) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant not found");
  }
  if (restaurant.ownerId.toString() !== userId) {
    throw new ForbiddenException(
      "Not authorized to manage this restaurant's hours",
    );
  }
  return restaurant;
};

// ================= GET ALL DAYS OPERATING HOURS =================

export const getAllDaysOperatingHoursService = async (restaurantId: string) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant not found");
  }

  return await findOperatingHoursByRestaurantId(restaurantId);
};

// ================= GET OPERATING HOURS BY DAY =================

export const getOperatingHoursByDayService = async (
  restaurantId: string,
  day: WeekDay,
) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant not found");
  }

  const hours = await findOperatingHoursByDay(restaurantId, day);
  if (!hours) {
    throw new NotFoundException(`Operating hours for ${day} not found`);
  }

  return hours;
};

// ================= BULK UPSERT ALL 7 DAYS =================

export const bulkUpsertOperatingHoursService = async (
  restaurantId: string,
  data: BulkUpsertOperatingHoursInput,
  userId: string,
) => {
  await assertRestaurantOwner(restaurantId, userId);
  await bulkUpsertOperatingHours(restaurantId, data);
  return await findOperatingHoursByRestaurantId(restaurantId);
};

// ================= DELETE ALL DAYS OPERATING HOURS =================

export const deleteAllDaysOperatingHoursService = async (
  restaurantId: string,
  userId: string,
) => {
  await assertRestaurantOwner(restaurantId, userId);
  await deleteOperatingHoursByRestaurantId(restaurantId);
  return;
};
