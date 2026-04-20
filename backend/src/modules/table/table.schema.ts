import { z } from "zod";

// ================= OBJECT ID =================

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "The restaurantId provided is not a valid ID");

// ================= PARAMS =================

const restaurantIdParamSchema = z.object({
  restaurantId: objectIdSchema,
});

const tableIdParamSchema = z.object({
  restaurantId: objectIdSchema,
  tableId: objectIdSchema,
});

// ================= GET AVAILABLE TABLES =================

export const getAvailableTablesSchema = {
  params: restaurantIdParamSchema,
  query: z.object({
    startTime: z
      .string()
      .datetime({ message: "startTime must be in ISO 8601 format" })
      .optional(),
  }),
};

// ================= GET TABLE BY ID =================

export const getTableByIdSchema = {
  params: tableIdParamSchema,
};

// ================= ADD TABLE =================

const tableBodySchema = z.object({
  tableNumber: z
    .string({ error: "Table number must be a string" })
    .min(1, "Table number cannot be empty")
    .max(10, "Table number cannot exceed 10 characters")
    .regex(
      /^[A-Za-z0-9\s-]+$/,
      "Name can only contain letters, numbers, space and hyphens",
    ),

  capacity: z
    .number({ error: "Capacity must be a number" })
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(30, "Capacity cannot exceed 30"),

  type: z.enum(["indoor", "outdoor", "vip"], {
    error: "Type must be indoor, outdoor, or vip",
  }),

  isActive: z.boolean({ error: "isActive must be a boolean" }).optional(),
});

export const addTableSchema = {
  params: restaurantIdParamSchema,
  body: tableBodySchema,
};

// ================= UPDATE TABLE =================

export const updateTableSchema = {
  params: tableIdParamSchema,
  body: tableBodySchema,
};

// ================= DELETE TABLE =================

export const deleteTableSchema = {
  params: tableIdParamSchema,
};

// ================= TYPES =================

export type TableBodyInput = z.infer<typeof tableBodySchema>;
export type AddTableInput = TableBodyInput;
export type UpdateTableInput = TableBodyInput;
