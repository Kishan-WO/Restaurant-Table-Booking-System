export const USER_ROLES = ["customer", "owner"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TABLE_TYPES = ["indoor", "outdoor", "vip"] as const;
export type TableType = (typeof TABLE_TYPES)[number];

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const BOOKING_STATUS = [
  "booked",
  "cancelled",
  "completed",
  "pending",
] as const;

export type BookingStatus = (typeof BOOKING_STATUS)[number];
