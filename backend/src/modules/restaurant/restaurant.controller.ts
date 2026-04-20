import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import {
  type CreateRestaurantInput,
  type UpdateRestaurantInput,
} from "./restaurant.schema.js";
import {
  createRestaurantService,
  deleteRestaurantService,
  getAllRestaurantsService,
  getOwnerRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
} from "./restaurant.service.js";
import { sendResponse } from "@/shared/utils/sendResponse.js";

// ================= CREATE =================

export const createRestaurantController = async (
  req: Request,
  res: Response,
) => {
  const restaurant = await createRestaurantService(
    req.body as CreateRestaurantInput,
    req.user!._id.toString(),
  );

  sendResponse(
    res,
    HTTPSTATUS.CREATED,
    restaurant,
    "Restaurant Created Successfully",
  );
};

// ================= GET ALL =================

export const getAllRestaurantsController = async (
  req: Request,
  res: Response,
) => {
  const restaurants = await getAllRestaurantsService();

  sendResponse(
    res,
    HTTPSTATUS.OK,
    restaurants,
    "Restaurants fetched successfully",
  );
};

// ================= GET OWNER RESTAURANTS =================

export const getOwnerRestaurantsController = async (
  req: Request,
  res: Response,
) => {
  const restaurants = await getOwnerRestaurantsService(
    req.user!._id.toString(),
  );

  sendResponse(
    res,
    HTTPSTATUS.OK,
    restaurants,
    "Owner Restaurants fetched successfully",
  );
};

// ================= GET BY ID =================

export const getRestaurantByIdController = async (
  req: Request,
  res: Response,
) => {
  const restaurant = await getRestaurantByIdService(req.params.id as string);
  sendResponse(
    res,
    HTTPSTATUS.OK,
    restaurant,
    "Restaurant fetched successfully",
  );
};

// ================= UPDATE =================

export const updateRestaurantController = async (
  req: Request,
  res: Response,
) => {
  const updatedRestaurant = await updateRestaurantService(
    req.params.id as string,
    req.body as UpdateRestaurantInput,
    req.user!._id.toString(),
  );
  sendResponse(
    res,
    HTTPSTATUS.OK,
    updatedRestaurant,
    "Restaurant updated successfully",
  );
};

// ================= DELETE =================

export const deleteRestaurantController = async (
  req: Request,
  res: Response,
) => {
  await deleteRestaurantService(
    req.params.id as string,
    req.user!._id.toString(),
  );
  sendResponse(res, HTTPSTATUS.OK, null, "Restaurant deleted successfully");
};
