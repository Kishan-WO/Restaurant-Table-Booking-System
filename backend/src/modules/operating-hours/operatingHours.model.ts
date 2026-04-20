import { WEEK_DAYS, type WeekDay } from "@/shared/constants/index.js";
import mongoose, { type Model, Schema } from "mongoose";

export interface ITimeRange {
  from: string; // "09:00"
  to: string; // "22:00"
}

export interface IOperatingHours {
  _id: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  day: WeekDay;
  enabled: boolean;
  ranges: ITimeRange[];
  createdAt: Date;
  updatedAt: Date;
}

const timeRangeSchema = new Schema<ITimeRange>(
  {
    from: { type: String, required: [true, "Start time is required"] },
    to: { type: String, required: [true, "End time is required"] },
  },
  { _id: false },
);

const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },

    day: {
      type: String,
      enum: WEEK_DAYS,
      required: [true, "Day is required"],
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    ranges: {
      type: [timeRangeSchema],
      default: [],
    },
  },
  { timestamps: true },
);

// One document per restaurant per day
operatingHoursSchema.index({ restaurantId: 1, day: 1 }, { unique: true });

const OperatingHoursModel: Model<IOperatingHours> =
  mongoose.model<IOperatingHours>("OperatingHours", operatingHoursSchema);

export default OperatingHoursModel;
