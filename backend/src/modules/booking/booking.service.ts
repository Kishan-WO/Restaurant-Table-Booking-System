import { acquireBookingLock, releaseBookingLock } from "./booking.cache.js";
import {
  cancelBooking,
  createBooking,
  findBookingById,
  findOverlappingBooking,
  getCustomerBookings,
  getOwnerAllBookings,
  updateBooking,
} from "./booking.dao.js";
import { findRestaurantById } from "../restaurant/restaurant.dao.js";
import { checkTableExist } from "../table/table.dao.js";
import { checkUserExist } from "../user/user.dao.js";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@/shared/utils/ApiError.js";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "./booking.schema.js";
import mongoose from "mongoose";
import { delay } from "@/shared/utils/delay.js";
import { convertToDate } from "./booking.helper.js";

// ================= CREATE BOOKING =================

export const createBookingService = async (
  reqBody: CreateBookingInput,
  userId: mongoose.Types.ObjectId,
) => {
  const { tableId, restaurantId, startTime } = reqBody;

  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  const { requestedStartTime, requestedEndTime } = convertToDate(
    startTime,
    restaurant.bookingConfig.slotDuration,
  );

  const isTableExist = await checkTableExist({ _id: tableId, restaurantId });
  if (!isTableExist) {
    throw new NotFoundException("Table Not Found");
  }

  const isUserExist = await checkUserExist({ _id: userId });
  if (!isUserExist) {
    throw new NotFoundException("User Not Found");
  }

  const overlapping = await findOverlappingBooking(
    reqBody.tableId,
    reqBody.startTime,
    requestedEndTime,
    null,
    restaurantId,
  );

  if (overlapping) {
    throw new ConflictException(
      "Table was just booked. select another time slot",
    );
  }

  const lockValue = await acquireBookingLock(
    tableId,
    requestedStartTime.toISOString(),
  );

  // await delay(30000);

  if (!lockValue) {
    throw new ConflictException(
      "Slot is currently being booked. Please try again.",
    );
  }

  try {
    const booking = await createBooking({
      ...reqBody,
      userId: userId.toString(),
      endTime: requestedEndTime.toISOString(),
    });

    const { __v, ...bookingObj } = booking.toJSON();
    return bookingObj;
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ConflictException(
        "This table was just booked. Please select another time slot.",
        err.keyValue,
      );
    }
    throw err;
  } finally {
    await releaseBookingLock(
      tableId,
      requestedStartTime.toISOString(),
      lockValue,
    );
  }
};

// ================= GET CUSTOMER BOOKINGS =================

export const getCustomerBookingsService = async (
  userId: mongoose.Types.ObjectId,
) => {
  return await getCustomerBookings(userId.toString());
};

// ================= GET OWNER ALL BOOKINGS =================

export const getOwnerAllBookingsService = async (
  ownerId: mongoose.Types.ObjectId,
) => {
  return await getOwnerAllBookings(ownerId.toString());
};

// ================= UPDATE BOOKING =================

export const updateBookingService = async (
  bookingId: string,
  reqBody: UpdateBookingInput,
  userId: string,
) => {
  const { tableId, startTime } = reqBody;
  const existing = await findBookingById(bookingId);
  if (!existing) throw new NotFoundException("Booking not found");

  if (new Date(existing.startTime).getTime() - Date.now() < 60 * 60 * 1000) {
    throw new BadRequestException(
      "Bookings can only be updated at least 1 hour before the start time.",
    );
  }

  if (existing.userId.toString() !== userId) {
    throw new ForbiddenException("Not authorized to update this booking");
  }

  if (existing.status === "cancelled") {
    throw new BadRequestException("Cannot update a cancelled booking");
  }

  const restaurant = await findRestaurantById(existing.restaurantId.toString());
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  const { requestedStartTime, requestedEndTime } = convertToDate(
    startTime,
    restaurant.bookingConfig.slotDuration,
  );

  const overlapping = await findOverlappingBooking(
    tableId,
    startTime,
    requestedEndTime,
    bookingId,
    existing.restaurantId.toString(),
  );

  if (overlapping) {
    throw new BadRequestException(
      "Table is already booked for the selected time slot",
    );
  }

  const lockValue = await acquireBookingLock(
    tableId,
    requestedStartTime.toISOString(),
  );

  if (!lockValue) {
    throw new ConflictException(
      "Slot is currently being booked. Please try again.",
    );
  }

  try {
    return await updateBooking(bookingId, reqBody);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new ConflictException(
        "This table was just booked. Please select another time slot.",
        err.keyValue,
      );
    }
    throw err;
  } finally {
    if (lockValue) {
      await releaseBookingLock(
        tableId,
        requestedStartTime.toISOString(),
        lockValue!,
      );
    }
  }
};

// ================= CANCEL BOOKING =================

export const cancelBookingService = async (
  bookingId: string,
  userId: string,
) => {
  const existing = await findBookingById(bookingId);
  if (!existing) throw new NotFoundException("Booking not found");

  if (existing.userId.toString() !== userId) {
    throw new ForbiddenException("Not authorized to cancel this booking");
  }

  if (new Date(existing.startTime).getTime() - Date.now() < 60 * 60 * 1000) {
    throw new BadRequestException(
      "Bookings can only be cancelled at least 1 hour before the start time.",
    );
  }

  if (existing.status === "cancelled") {
    throw new BadRequestException("Booking is already cancelled");
  }

  return await cancelBooking(bookingId);
};
