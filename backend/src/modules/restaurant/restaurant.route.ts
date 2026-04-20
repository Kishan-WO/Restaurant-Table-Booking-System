import { Router } from "express";
import { validateMiddleware } from "@/shared/middlewares/validate.middleware.js";
import {
  createRestaurantController,
  deleteRestaurantController,
  getAllRestaurantsController,
  getOwnerRestaurantsController,
  getRestaurantByIdController,
  updateRestaurantController,
} from "./restaurant.controller.js";
import {
  createRestaurantSchema,
  deleteRestaurantSchema,
  getRestaurantsByIdSchema,
  updateRestaurantSchema,
} from "./restaurant.schema.js";
import {
  PLAIN_TEXT_OPTIONS,
  sanitizeMiddleware,
} from "@/shared/middlewares/sanitize.middleware.js";
import { authenticateMiddleware } from "@/shared/middlewares/authenticate.middleware.js";
import authorizeMiddleware from "@/shared/middlewares/authorize.middleware.js";

const router = Router();

router.post(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  sanitizeMiddleware({
    body: {
      description: PLAIN_TEXT_OPTIONS,
    },
  }),
  validateMiddleware(createRestaurantSchema),
  createRestaurantController,
);

router.put(
  "/:id",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  sanitizeMiddleware({
    body: {
      description: PLAIN_TEXT_OPTIONS,
    },
  }),
  validateMiddleware(updateRestaurantSchema),
  updateRestaurantController,
);

router.delete(
  "/:id",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(deleteRestaurantSchema),
  deleteRestaurantController,
);

router.get(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["customer", "owner"]),
  getAllRestaurantsController,
);

router.get(
  "/my",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  getOwnerRestaurantsController,
);

router.get(
  "/:id",
  authenticateMiddleware,
  authorizeMiddleware(["customer", "owner"]),
  validateMiddleware(getRestaurantsByIdSchema),
  getRestaurantByIdController,
);

export default router;
