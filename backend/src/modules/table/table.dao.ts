import type { QueryFilter } from "mongoose";
import BookingModel from "../booking/booking.model.js";
import TableModel from "./table.model.js";
import type { ITable } from "./table.model.js";
import type { AddTableInput, UpdateTableInput } from "./table.schema.js";

type TableQuery = QueryFilter<ITable>;

// ================= FIND BY ID =================

export const findTableById = (tableId: string) => {
  return TableModel.findById(tableId).select("-__v").lean();
};

// ================= FIND BY RESTAURANT =================

export const findTablesByRestaurantId = (restaurantId: string) => {
  return TableModel.find({ restaurantId }).select("-__v").lean();
};

// ================= FIND UNBOOKED TABLES =================

export const findUnbookedTables = async (
  restaurantId: string,
  startTime: Date,
  endTime: Date,
) => {
  const bookedTableIds = await BookingModel.distinct("tableId", {
    restaurantId,
    status: { $in: ["booked"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  return TableModel.find({
    restaurantId,
    _id: { $nin: bookedTableIds },
  })
    .select("-__v")
    .lean();
};

// ================= ADD =================

export const addTable = (
  tableData: AddTableInput & { restaurantId: string },
) => {
  return TableModel.create(tableData);
};

// ================= UPDATE =================

export const updateTable = (tableId: string, tableData: UpdateTableInput) => {
  return TableModel.findByIdAndUpdate(tableId, tableData, {
    new: true,
    runValidators: true,
  })
    .select("-__v")
    .lean();
};

// ================= DELETE =================

export const deleteTable = (tableId: string) => {
  return TableModel.findByIdAndDelete(tableId).lean();
};

// ================= EXISTS =================

export const checkTableExist = (query: TableQuery) => {
  return TableModel.exists(query);
};
