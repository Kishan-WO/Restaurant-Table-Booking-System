import { z } from "zod";

// ================= COMMON =================

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm

const rangeSchema = z
  .object({
    from: z
      .string({ error: "Start time must be a string" })
      .min(1, "Start time cannot be empty")
      .regex(timeRegex, "Start time must be in HH:mm format"),

    to: z
      .string({ error: "End time must be a string" })
      .min(1, "End time cannot be empty")
      .regex(timeRegex, "End time must be in HH:mm format"),
  })
  .refine(
    (val) => {
      const [fromH = 0, fromM = 0] = val.from.split(":").map(Number);
      const [toH = 0, toM = 0] = val.to.split(":").map(Number);
      return fromH * 60 + fromM < toH * 60 + toM;
    },
    { message: "Start time must be earlier than end time" },
  );

const daySchema = z
  .object({
    enabled: z.boolean({ error: "Enabled must be a boolean" }),
    ranges: z.array(rangeSchema),
  })
  .refine(
    (val) => {
      if (val.enabled && val.ranges.length < 1) return false;
      return true;
    },
    {
      message: "At least one time range is required when day is enabled",
      path: ["ranges"],
    },
  )
  .refine(
    (val) => {
      if (!val.enabled && val.ranges.length > 0) return false;
      return true;
    },
    {
      message: "No time ranges allowed when day is disabled",
      path: ["ranges"],
    },
  );

// ================= OBJECT ID =================

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "The restaurantId provided is not a valid ID");

// ================= CREATE RESTAURANT =================

const createRestaurantBodySchema = z.object({
  name: z
    .string({ error: "Name must be a string" })
    .min(1, "Name cannot be empty")
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name cannot exceed 255 characters")
    .regex(
      /^[A-Za-z0-9\s]+$/,
      "Name can only contain letters, Numbers and space",
    ),

  address: z
    .string({ error: "Address must be a string" })
    .min(1, "Address cannot be empty")
    .min(10, "Address must be at least 10 characters")
    .max(255, "Address cannot exceed 255 characters")
    .regex(/^[A-Za-z0-9\s,.\-/#']+$/, "Address contains invalid characters"),

  contact: z
    .object({
      phone: z
        .string({ error: "Phone must be a string" })
        .min(1, "Phone cannot be empty")
        .regex(/^[0-9]{10}$/, "Invalid phone"),

      email: z
        .string({ error: "Email must be a string" })
        .min(1, "Email cannot be empty")
        .max(255, "Email cannot exceed 255 characters")
        .email("Invalid email"),
    })
    .refine((val) => !!val, { message: "Contact information is required" }),

  description: z
    .string({ error: "Description must be a string" })
    .min(1, "Description cannot be empty")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),

  bookingConfig: z
    .object({
      slotDuration: z
        .number({ error: "Slot duration must be a number" })
        .int("Slot duration must be an integer")
        .min(15, "Slot duration must be at least 15 minutes")
        .max(480, "Slot duration cannot exceed 480 minutes")
        .optional(),

      bufferTime: z
        .number({ error: "Buffer time must be a number" })
        .int("Buffer time must be an integer")
        .min(0, "Buffer time cannot be negative")
        .max(120, "Buffer time cannot exceed 120 minutes")
        .optional(),

      advanceBookingDays: z
        .number({ error: "Advance booking days must be a number" })
        .int("Advance booking days must be an integer")
        .min(1, "Advance booking days must be at least 1")
        .max(90, "Advance booking days cannot exceed 90")
        .optional(),

      maxGuestsPerBooking: z
        .number({ error: "Max guests must be a number" })
        .int("Max guests must be an integer")
        .min(1, "Max guests must be at least 1")
        .max(100, "Max guests cannot exceed 100")
        .optional(),
    })
    .optional(),
});

export const createRestaurantSchema = {
  body: createRestaurantBodySchema,
};

// ================= UPDATE RESTAURANT =================

const updateRestaurantBodySchema = createRestaurantBodySchema;

const updateRestaurantParamsSchema = z.object({
  id: objectIdSchema,
});

export const updateRestaurantSchema = {
  body: updateRestaurantBodySchema,
  params: updateRestaurantParamsSchema,
};

// ================= DELETE RESTAURANT =================

export const deleteRestaurantSchema = {
  params: z.object({ id: objectIdSchema }),
};

// ================= GET RESTAURANT BY ID =================

export const getRestaurantsByIdSchema = {
  params: z.object({ id: objectIdSchema }),
};

// ================= TYPES =================

export type CreateRestaurantInput = z.infer<typeof createRestaurantBodySchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantBodySchema>;
