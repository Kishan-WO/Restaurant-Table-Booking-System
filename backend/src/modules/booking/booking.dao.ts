import type { QueryFilter } from "mongoose";
import BookingModel from "./booking.model.js";
import type { IBooking } from "./booking.model.js";
import RestaurantModel from "../restaurant/restaurant.model.js";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "./booking.schema.js";
import { BOOKING_STATUS } from "@/shared/constants/index.js";

type BookingQuery = QueryFilter<IBooking>;

// ================= EXISTS =================

export const checkBookingExist = (query: BookingQuery) => {
  return BookingModel.exists(query);
};

// ================= CREATE =================

export const createBooking = (
  data: CreateBookingInput & { userId: string; endTime: string },
) => {
  return BookingModel.create({ ...data, status: BOOKING_STATUS[0] });
};

// ================= GET CUSTOMER BOOKINGS =================

export const getCustomerBookings = (customerId: string) => {
  return BookingModel.find({ userId: customerId })
    .populate("tableId", "tableNumber type capacity")
    .select("-__v")
    .lean();
};

// ================= GET OWNER ALL BOOKINGS =================

export const getOwnerAllBookings = async (ownerId: string) => {
  const restaurants = await RestaurantModel.find({ ownerId })
    .select("_id")
    .lean();

  const restaurantIds = restaurants.map((r) => r._id);

  return BookingModel.find({ restaurantId: { $in: restaurantIds } })
    .populate("tableId", "tableNumber type capacity")
    .select("-__v")
    .lean();
};

// ================= FIND BY ID =================

export const findBookingById = (id: string) => {
  return BookingModel.findById(id)
    .populate("tableId", "tableNumber type capacity")
    .select("-__v")
    .lean();
};

// ================= UPDATE =================

export const updateBooking = (id: string, data: UpdateBookingInput) => {
  return BookingModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true, select: "-__v" },
  ).lean();
};

// ================= CANCEL =================

export const cancelBooking = (id: string) => {
  return BookingModel.findByIdAndUpdate(
    id,
    { $set: { status: "cancelled" } },
    { new: true, select: "-__v" },
  ).lean();
};

// ================= FIND OVERLAPPING =================

export const findOverlappingBooking = (
  tableId: string,
  startTime: Date | string,
  endTime: Date | string,
  excludeId: string | null = null,
  restaurantId: string,
) => {
  const query: BookingQuery = {
  restaurantId,
  tableId,
  status: { $ne: "cancelled" },
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },
};

  if (excludeId) query._id = { $ne: excludeId };

  return BookingModel.findOne(query).lean();
};
