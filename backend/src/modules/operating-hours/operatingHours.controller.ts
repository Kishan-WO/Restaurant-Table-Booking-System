import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import { sendResponse } from "@/shared/utils/sendResponse.js";
import type { WeekDay } from "@/shared/constants/index.js";
import type { BulkUpsertOperatingHoursInput } from "./operatingHours.schema.js";
import {
  bulkUpsertOperatingHoursService,
  deleteAllDaysOperatingHoursService,
  getAllDaysOperatingHoursService,
  getOperatingHoursByDayService,
} from "./operatingHours.service.js";

// ================= GET ALL DAYS OPERATING HOURS =================

export const getAllDaysOperatingHoursController = async (
  req: Request,
  res: Response,
) => {
  const hours = await getAllDaysOperatingHoursService(
    req.params.restaurantId as string,
  );

  sendResponse(
    res,
    HTTPSTATUS.OK,
    hours,
    "Operating hours fetched successfully",
  );
};

// ================= GET OPERATING HOURS BY DAY =================

export const getOperatingHoursByDayController = async (
  req: Request,
  res: Response,
) => {
  const hours = await getOperatingHoursByDayService(
    req.params.restaurantId as string,
    req.params.day as WeekDay,
  );

  sendResponse(
    res,
    HTTPSTATUS.OK,
    hours,
    "Operating hours fetched successfully",
  );
};

// ================= BULK UPSERT ALL 7 DAYS =================

export const bulkUpsertOperatingHoursController = async (
  req: Request,
  res: Response,
) => {
  const hours = await bulkUpsertOperatingHoursService(
    req.params.restaurantId as string,
    req.body as BulkUpsertOperatingHoursInput,
    req.user!._id.toString(),
  );

  sendResponse(
    res,
    HTTPSTATUS.OK,
    hours,
    "Operating hours updated successfully",
  );
};

// ================= DELETE ALL DAYS OPERATING HOURS ==================

export const deleteAllDaysOperatingHoursController = async (
  req: Request,
  res: Response,
) => {
  await deleteAllDaysOperatingHoursService(
    req.params.restaurantId as string,
    req.user!._id.toString(),
  );
  sendResponse(
    res,
    HTTPSTATUS.OK,
    null,
    "Operating hours deleted successfully",
  );
};
