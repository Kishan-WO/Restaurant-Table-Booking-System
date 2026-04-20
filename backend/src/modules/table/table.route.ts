import { Router } from "express";
import { validateMiddleware } from "@/shared/middlewares/validate.middleware.js";
import { authenticateMiddleware } from "@/shared/middlewares/authenticate.middleware.js";
import authorizeMiddleware from "@/shared/middlewares/authorize.middleware.js";
import {
  addTableController,
  deleteTableController,
  getAvailableTablesController,
  getTableByIdController,
  updateTableController,
} from "./table.controller.js";
import {
  addTableSchema,
  deleteTableSchema,
  getAvailableTablesSchema,
  getTableByIdSchema,
  updateTableSchema,
} from "./table.schema.js";

const router = Router({ mergeParams: true });

router.get(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["customer", "owner"]),
  validateMiddleware(getAvailableTablesSchema),
  getAvailableTablesController,
);

router.get(
  "/:tableId",
  validateMiddleware(getTableByIdSchema),
  getTableByIdController,
);

router.post(
  "/",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(addTableSchema),
  addTableController,
);

router.put(
  "/:tableId",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(updateTableSchema),
  updateTableController,
);

router.delete(
  "/:tableId",
  authenticateMiddleware,
  authorizeMiddleware(["owner"]),
  validateMiddleware(deleteTableSchema),
  deleteTableController,
);

export default router;
