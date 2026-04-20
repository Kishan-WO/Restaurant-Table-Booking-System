import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import { sendResponse } from "@/shared/utils/sendResponse.js";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "./booking.schema.js";
import {
  cancelBookingService,
  createBookingService,
  getCustomerBookingsService,
  getOwnerAllBookingsService,
  updateBookingService,
} from "./booking.service.js";

// ================= CREATE =================

export const createBookingController = async (req: Request, res: Response) => {
  const booking = await createBookingService(
    req.body as CreateBookingInput,
    req.user!._id,
  );

  sendResponse(
    res,
    HTTPSTATUS.CREATED,
    booking,
    "Booking Completed Successfully",
  );
};

// ================= GET CUSTOMER BOOKINGS =================

export const getCustomerBookingsController = async (
  req: Request,
  res: Response,
) => {
  const bookings = await getCustomerBookingsService(req.user!._id);

  sendResponse(res, HTTPSTATUS.OK, bookings, "Bookings fetched successfully");
};

// ================= GET OWNER ALL BOOKINGS =================

export const getOwnerAllBookingsController = async (
  req: Request,
  res: Response,
) => {
  const bookings = await getOwnerAllBookingsService(req.user!._id);

  sendResponse(res, HTTPSTATUS.OK, bookings, "Bookings fetched successfully");
};

// ================= UPDATE =================

export const updateBookingController = async (req: Request, res: Response) => {
  const booking = await updateBookingService(
    req.params.id as string,
    req.body as UpdateBookingInput,
    req.user!._id.toString(),
  );

  sendResponse(res, HTTPSTATUS.OK, booking, "Booking updated successfully");
};

// ================= CANCEL =================

export const cancelBookingController = async (req: Request, res: Response) => {
  const booking = await cancelBookingService(
    req.params.id as string,
    req.user!._id.toString(),
  );

  sendResponse(res, HTTPSTATUS.OK, booking, "Booking cancelled successfully");
};
