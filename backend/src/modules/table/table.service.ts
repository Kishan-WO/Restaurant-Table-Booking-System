import {
  addTable,
  checkTableExist,
  deleteTable,
  findTableById,
  findTablesByRestaurantId,
  findUnbookedTables,
  updateTable,
} from "./table.dao.js";
import { findRestaurantById } from "../restaurant/restaurant.dao.js";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@/shared/utils/ApiError.js";

import type { AddTableInput, UpdateTableInput } from "./table.schema.js";
import { getAvailableTables } from "../booking/booking.helper.js";

// ================= GUARD: restaurant exists + caller is owner =================

const assertRestaurantOwner = async (restaurantId: string, userId: string) => {
  const restaurant = await findRestaurantById(restaurantId);
  console.log(restaurant, restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }
  if (restaurant.ownerId.toString() !== userId) {
    throw new ForbiddenException(
      "You are not authorized to manage this restaurant's tables",
    );
  }
  return restaurant;
};

// ================= GET AVAILABLE TABLES =================

export const getAvailableTablesService = async (
  restaurantId: string,
  startTime: string | undefined,
) => {
  const restaurant = await findRestaurantById(restaurantId);
  console.log(restaurant, restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  if (!startTime) {
    return await findTablesByRestaurantId(restaurantId);
  }

  const requestedStartTime = new Date(startTime);
  if (isNaN(requestedStartTime.getTime())) {
    throw new BadRequestException("Invalid startTime format");
  }

  const slotDurationMs = restaurant.bookingConfig.slotDuration * 60 * 1000;
  const requestedEndTime = new Date(
    requestedStartTime.getTime() + slotDurationMs,
  );

  const tables = await findUnbookedTables(
    restaurantId,
    requestedStartTime,
    requestedEndTime,
  );

  const ret = await getAvailableTables(tables, requestedStartTime);
  return ret;
};

// ================= GET TABLE BY ID =================

export const getTableByIdService = async (
  restaurantId: string,
  tableId: string,
) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  const table = await findTableById(tableId);
  if (!table) {
    throw new NotFoundException("Table Not Found");
  }
  return table;
};

// ================= ADD TABLE =================

export const addTableService = async (
  restaurantId: string,
  tableData: AddTableInput,
  userId: string,
) => {
  await assertRestaurantOwner(restaurantId, userId);
  return await addTable({ ...tableData, restaurantId });
};

// ================= UPDATE TABLE =================

export const updateTableService = async (
  restaurantId: string,
  tableId: string,
  tableData: UpdateTableInput,
  userId: string,
) => {
  await assertRestaurantOwner(restaurantId, userId);

  const isTableExist = await checkTableExist({ _id: tableId, restaurantId });
  if (!isTableExist) {
    throw new NotFoundException("Table Not Found");
  }

  return await updateTable(tableId, tableData);
};

// ================= DELETE TABLE =================

export const deleteTableService = async (
  restaurantId: string,
  tableId: string,
  userId: string,
) => {
  await assertRestaurantOwner(restaurantId, userId);

  const isTableExist = await checkTableExist({ _id: tableId, restaurantId });
  if (!isTableExist) {
    throw new NotFoundException("Table Not Found");
  }

  return await deleteTable(tableId);
};
