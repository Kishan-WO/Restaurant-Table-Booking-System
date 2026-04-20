import mongoose, { type Model, Schema } from "mongoose";

export interface IContact {
  phone: string;
  email: string;
}

export interface IBookingConfig {
  slotDuration: number;
  bufferTime: number;
  advanceBookingDays: number;
  maxGuestsPerBooking: number;
}

export interface IRestaurant {
  _id: mongoose.Types.ObjectId;

  name: string;
  address: string;

  contact: IContact;

  ownerId: mongoose.Types.ObjectId;

  description: string;

  bookingConfig: IBookingConfig;

  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Name is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    contact: {
      phone: {
        type: String,
        required: [true, "Phone is required"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
      },
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },

    description: {
      type: String,
      default: "",
    },

    bookingConfig: {
      slotDuration: {
        type: Number,
        default: 60,
      },

      bufferTime: {
        type: Number,
        default: 0,
      },

      advanceBookingDays: {
        type: Number,
        default: 7,
      },

      maxGuestsPerBooking: {
        type: Number,
        default: 20,
      },
    },
  },
  {
    timestamps: true,
  },
);

const RestaurantModel: Model<IRestaurant> =
  mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

export default RestaurantModel;