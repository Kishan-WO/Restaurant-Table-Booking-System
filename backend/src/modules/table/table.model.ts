import { TABLE_TYPES, type TableType } from "@/shared/constants/index.js";
import mongoose, { type Model, Schema } from "mongoose";

export interface ITable {
  _id: mongoose.Types.ObjectId;

  restaurantId: mongoose.Types.ObjectId;

  tableNumber: string;
  capacity: number;

  type: TableType;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },

    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
    },

    type: {
      type: String,
      enum: TABLE_TYPES,
      default: "indoor",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const TableModel: Model<ITable> = mongoose.model<ITable>("Table", tableSchema);

export default TableModel;
