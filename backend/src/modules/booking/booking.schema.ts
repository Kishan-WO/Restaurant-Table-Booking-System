import { z } from "zod";

// ================= OBJECT ID =================

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "The restaurantId provided is not a valid ID");

// ================= SHARED =================

const bookingIdParamsSchema = z.object({
  id: objectIdSchema,
});

// ================= CREATE BOOKING =================

const createBookingBodySchema = z.object({
  restaurantId: objectIdSchema,

  tableId: objectIdSchema,

  startTime: z.iso
    .datetime({ message: "Start time must be an ISO 8601 date string" })
    .pipe(z.coerce.date())
    .refine((date) => date > new Date(), {
      message: "Start time must be in the future",
    }),

  guests: z
    .number({ error: "Guests must be a number" })
    .int("Guests must be an integer")
    .min(1, "At least 1 guest is required")
    .max(30, "Guests cannot exceed 30"),

  guestDetails: z.object({
    phone: z
      .string({ error: "Phone must be a string" })
      .min(1, "Phone cannot be empty")
      .regex(/^[0-9]{10}$/, "Phone must be a valid 10-digit number"),

    name: z
      .string({ error: "Name must be a string" })
      .min(1, "Name cannot be empty")
      .min(2, "Name must be at least 2 characters long")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and space"),
  }),

  notes: z
    .string({ error: "Notes must be a string" })
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

export const createBookingSchema = {
  body: createBookingBodySchema,
};

// ================= UPDATE BOOKING =================
// restaurantId is forbidden on update — omit it from the body

const updateBookingBodySchema = createBookingBodySchema.omit({
  restaurantId: true,
});

export const updateBookingSchema = {
  params: bookingIdParamsSchema,
  body: updateBookingBodySchema,
};

// ================= CANCEL BOOKING =================

export const cancelBookingSchema = {
  params: bookingIdParamsSchema,
};

// ================= TYPES =================

export type CreateBookingInput = z.infer<typeof createBookingBodySchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingBodySchema>;
