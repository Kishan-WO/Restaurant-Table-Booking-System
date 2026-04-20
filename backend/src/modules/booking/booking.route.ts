import { Router } from "express";
import { validateMiddleware } from "@/shared/middlewares/validate.middleware.js";
import { authenticateMiddleware } from "@/shared/middlewares/authenticate.middleware.js";
import authorizeMiddleware from "@/shared/middlewares/authorize.middleware.js";
import {
  PLAIN_TEXT_OPTIONS,
  sanitizeMiddleware,
} from "@/shared/middlewares/sanitize.middleware.js";
import {
  cancelBookingController,
  createBookingController,
  getCustomerBookingsController,
  getOwnerAllBookingsController,
  updateBookingController,
} from "./booking.controller.js";
import {
  cancelBookingSchema,
  createBookingSchema,
  updateBookingSchema,
} from "./booking.schema.js";

const router = Router();

router.post(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["customer"]),
  sanitizeMiddleware({ body: { notes: PLAIN_TEXT_OPTIONS } }),
  validateMiddleware(createBookingSchema),
  createBookingController,
);

router.get(
  "/my",
  authenticateMiddleware,
  authorizeMiddleware(["customer"]),
  getCustomerBookingsController,
);

router.get(
  "/owner",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  getOwnerAllBookingsController,
);

router.put(
  "/:id",
  authenticateMiddleware,
  authorizeMiddleware(["customer"]),
  sanitizeMiddleware({ body: { notes: PLAIN_TEXT_OPTIONS } }),
  validateMiddleware(updateBookingSchema),
  updateBookingController,
);

router.patch(
  "/:id/cancel",
  authenticateMiddleware,
  authorizeMiddleware(["customer"]),
  validateMiddleware(cancelBookingSchema),
  cancelBookingController,
);

export default router;
