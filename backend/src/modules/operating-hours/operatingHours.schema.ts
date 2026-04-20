import { z } from "zod";
import { WEEK_DAYS } from "@/shared/constants/index.js";

// ================= OBJECT ID =================

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "The restaurantId provided is not a valid ID");

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

// ================= PARAMS =================

const operatingHoursParamsSchema = z.object({
  restaurantId: objectIdSchema,
});

const operatingHoursDayParamsSchema = z.object({
  restaurantId: objectIdSchema,
  day: z.enum(WEEK_DAYS, { error: "Invalid day" }),
});

// ================= UPSERT (SET ONE DAY) =================

// PUT /restaurants/:restaurantId/hours/:day
const upsertOperatingHoursBodySchema = z
  .object({
    enabled: z.boolean({ error: "Enabled must be a boolean" }),
    ranges: z.array(rangeSchema),
  })
  .refine((val) => !(val.enabled && val.ranges.length < 1), {
    message: "At least one time range is required when day is enabled",
    path: ["ranges"],
  })
  .refine((val) => !(!val.enabled && val.ranges.length > 0), {
    message: "No time ranges allowed when day is disabled",
    path: ["ranges"],
  });

export const upsertOperatingHoursSchema = {
  params: operatingHoursDayParamsSchema,
  body: upsertOperatingHoursBodySchema,
};

// ================= BULK UPSERT (SET ALL 7 DAYS) =================

const bulkUpsertOperatingHoursBodySchema = z.object({
  monday: upsertOperatingHoursBodySchema,
  tuesday: upsertOperatingHoursBodySchema,
  wednesday: upsertOperatingHoursBodySchema,
  thursday: upsertOperatingHoursBodySchema,
  friday: upsertOperatingHoursBodySchema,
  saturday: upsertOperatingHoursBodySchema,
  sunday: upsertOperatingHoursBodySchema,
});

export const bulkUpsertOperatingHoursSchema = {
  params: operatingHoursParamsSchema,
  body: bulkUpsertOperatingHoursBodySchema,
};

// ================= GET ALL DAYS OPERATING HOURS =================

export const getAllDaysOperatingHoursSchema = {
  params: operatingHoursParamsSchema,
};

// ================= GET OPERATING HOURS BY DAY =================

export const getOperatingHoursByDaySchema = {
  params: operatingHoursDayParamsSchema,
};

// ================= DELETE ALL DAYS OPERATING HOURS =================

export const deleteAllDaysOperatingHoursSchema = {
  params: operatingHoursParamsSchema,
};

// ================= TYPES =================

export type UpsertOperatingHoursInput = z.infer<
  typeof upsertOperatingHoursBodySchema
>;
export type BulkUpsertOperatingHoursInput = z.infer<
  typeof bulkUpsertOperatingHoursBodySchema
>;
export type AllDaysOperatingHoursParams = z.infer<
  typeof operatingHoursParamsSchema
>;

export type OperatingHoursDayParams = z.infer<
  typeof operatingHoursDayParamsSchema
>;
