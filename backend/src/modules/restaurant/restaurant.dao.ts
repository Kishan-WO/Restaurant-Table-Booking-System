import { type QueryFilter } from "mongoose";

import RestaurantModel from "./restaurant.model.js";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "./restaurant.schema.js";

type RestaurantQuery = QueryFilter<typeof RestaurantModel>;

// ================= EXISTS =================

export const checkRestaurantExist = (query: RestaurantQuery) => {
  return RestaurantModel.exists(query);
};

// ================= CREATE =================

export const createRestaurant = (
  data: CreateRestaurantInput & { ownerId: string },
) => {
  return RestaurantModel.create(data);
};

// ================= UPDATE =================

export const updateRestaurant = (id: string, data: UpdateRestaurantInput) => {
  return RestaurantModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  })
    .select("-__v")
    .lean();
};

// ================= DELETE =================

export const deleteRestaurant = (id: string) => {
  return RestaurantModel.findByIdAndDelete(id).lean();
};

// ================= FIND BY NAME =================

export const findRestaurantByName = (name: string) => {
  return RestaurantModel.findOne({ name }).select("-__v").lean();
};

// ================= GET ALL =================

export const getAllRestaurants = () => {
  return RestaurantModel.find().select("-__v").lean();
};

// ================= FIND BY ID =================

export const findRestaurantById = (id: string) => {
  return RestaurantModel.findById(id).select("-__v").lean();
};

// ================= FIND BY OWNER ID =================

export const findRestaurantsByOwnerId = (ownerId: string) => {
  return RestaurantModel.find({ ownerId }).select("-__v").lean();
};
