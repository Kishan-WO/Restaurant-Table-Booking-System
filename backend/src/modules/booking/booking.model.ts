import {
  BOOKING_STATUS,
  type BookingStatus,
} from "@/shared/constants/index.js";
import mongoose, { type Model, Schema } from "mongoose";

export interface IGuestDetails {
  phone: string;
  name?: string;
}

export interface IBooking {
  _id: mongoose.Types.ObjectId;

  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;

  startTime: Date;
  endTime: Date;

  guests: number;

  guestDetails: IGuestDetails;

  notes?: string;

  status: BookingStatus;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },

    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Table ID is required"],
    },

    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },

    guests: {
      type: Number,
      required: [true, "Guests count is required"],
      min: [1, "At least 1 guest is required"],
    },

    guestDetails: {
      phone: {
        type: String,
        required: [true, "Guest phone is required"],
      },
      name: {
        type: String,
      },
    },

    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index(
  { tableId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["booked", "pending"] },
    },
  },
);

const BookingModel: Model<IBooking> = mongoose.model<IBooking>(
  "Booking",
  bookingSchema,
);

export default BookingModel;
