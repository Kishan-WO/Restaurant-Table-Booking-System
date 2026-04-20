import { z } from "zod";

// ================= LOGIN =================

const loginBodySchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .min(1, "Email cannot be empty")
    .email("Invalid email"),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export const loginSchema = {
  body: loginBodySchema,
};

// ================= REGISTER =================

const registerBodySchema = z
  .object({
    role: z
      .string({ error: "Role is required" })
      .min(1, "Role cannot be empty")
      .refine((val) => ["customer", "owner"].includes(val), {
        message: "Role must be either customer or owner",
      }),

    name: z
      .string({ error: "Name is required" })
      .min(2, "Name must be at least 2 characters long")
      .regex(/^[A-Za-z0-9\s]+$/, "Name can only contain letters and space"),

    phone: z
      .string({ error: "Phone is required" })
      .regex(/^[0-9]{10}$/, "Phone must be a valid 10-digit number"),

    email: z
      .string({ error: "Email is required" })
      .min(1, "Email cannot be empty")
      .email("Invalid email"),

    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),

    confirmPassword: z
      .string({ error: "Confirm password is required" })
      .min(1, "Confirm password cannot be empty"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match password",
    path: ["confirmPassword"],
  });

export const registerSchema = {
  body: registerBodySchema,
};

// ================= TYPES =================

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
