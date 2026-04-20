import {
  createRestaurant,
  deleteRestaurant,
  findRestaurantById,
  findRestaurantByName,
  findRestaurantsByOwnerId,
  getAllRestaurants,
  updateRestaurant,
} from "./restaurant.dao.js";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@/shared/utils/ApiError.js";
import type {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "./restaurant.schema.js";

// ================= CREATE =================

export const createRestaurantService = async (
  reqBody: CreateRestaurantInput,
  userId: string,
) => {
  const isRestaurantExist = await findRestaurantByName(reqBody.name);
  if (isRestaurantExist) {
    throw new ConflictException("Restaurant name already in use");
  }

  const restaurant = await createRestaurant({ ...reqBody, ownerId: userId });
  const { __v, ...restaurantObj } = restaurant.toJSON();
  return restaurantObj;
};

// ================= UPDATE =================

export const updateRestaurantService = async (
  resId: string,
  reqBody: UpdateRestaurantInput,
  userId: string,
) => {
  const restaurant = await findRestaurantById(resId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  if (restaurant.ownerId.toString() !== userId) {
    throw new ForbiddenException(
      "Not authorized to update other owner's Restaurant",
    );
  }

  return await updateRestaurant(resId, reqBody);
};

// ================= DELETE =================

export const deleteRestaurantService = async (
  resId: string,
  userId: string,
) => {
  const restaurant = await findRestaurantById(resId);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  if (restaurant.ownerId.toString() !== userId) {
    throw new ForbiddenException("Not authorized to delete Restaurant");
  }

  return await deleteRestaurant(resId);
};

// ================= GET OWNER RESTAURANTS =================

export const getOwnerRestaurantsService = async (ownerId: string) => {
  return await findRestaurantsByOwnerId(ownerId);
};

// ================= GET ALL =================

export const getAllRestaurantsService = async () => {
  return await getAllRestaurants();
};

// ================= GET BY ID =================

export const getRestaurantByIdService = async (id: string) => {
  const restaurant = await findRestaurantById(id);
  if (!restaurant) {
    throw new NotFoundException("Restaurant Not Found");
  }

  return restaurant;
};
