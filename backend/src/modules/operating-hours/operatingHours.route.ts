import { Router } from "express";
import { validateMiddleware } from "@/shared/middlewares/validate.middleware.js";
import { authenticateMiddleware } from "@/shared/middlewares/authenticate.middleware.js";
import authorizeMiddleware from "@/shared/middlewares/authorize.middleware.js";
import {
  bulkUpsertOperatingHoursController,
  deleteAllDaysOperatingHoursController,
  getAllDaysOperatingHoursController,
  getOperatingHoursByDayController,
} from "./operatingHours.controller.js";
import {
  bulkUpsertOperatingHoursSchema,
  getOperatingHoursByDaySchema,
  getAllDaysOperatingHoursSchema,
  deleteAllDaysOperatingHoursSchema,
} from "./operatingHours.schema.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  validateMiddleware(getAllDaysOperatingHoursSchema),
  getAllDaysOperatingHoursController,
);

router.get(
  "/:day",
  validateMiddleware(getOperatingHoursByDaySchema),
  getOperatingHoursByDayController,
);

router.put(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(bulkUpsertOperatingHoursSchema),
  bulkUpsertOperatingHoursController,
);

router.delete(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(deleteAllDaysOperatingHoursSchema),
  deleteAllDaysOperatingHoursController,
);

export default router;
