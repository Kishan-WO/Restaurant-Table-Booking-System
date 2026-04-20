import type { Request, Response } from "express";
import { HTTPSTATUS } from "@/shared/utils/HttpStatusCode.js";
import { sendResponse } from "@/shared/utils/sendResponse.js";
import type { AddTableInput, UpdateTableInput } from "./table.schema.js";
import {
  addTableService,
  deleteTableService,
  getAvailableTablesService,
  getTableByIdService,
  updateTableService,
} from "./table.service.js";

// ================= GET AVAILABLE TABLES =================

export const getAvailableTablesController = async (
  req: Request,
  res: Response,
) => {
  const tables = await getAvailableTablesService(
    req.params.restaurantId as string,
    req.query.startTime as string | undefined,
  );

  sendResponse(res, HTTPSTATUS.OK, tables, "Tables fetched successfully");
};

// ================= GET TABLE BY ID =================

export const getTableByIdController = async (req: Request, res: Response) => {
  console.log(req.params);
  const table = await getTableByIdService(
    req.params.restaurantId as string,
    req.params.tableId as string,
  );

  sendResponse(res, HTTPSTATUS.OK, table, "Table fetched successfully");
};

// ================= ADD TABLE =================

export const addTableController = async (req: Request, res: Response) => {
  const table = await addTableService(
    req.params.restaurantId as string,
    req.body as AddTableInput,
    req.user!._id.toString(),
  );

  sendResponse(res, HTTPSTATUS.CREATED, table, "Table added successfully");
};

// ================= UPDATE TABLE =================

export const updateTableController = async (req: Request, res: Response) => {
  const table = await updateTableService(
    req.params.restaurantId as string,
    req.params.tableId as string,
    req.body as UpdateTableInput,
    req.user!._id.toString(),
  );

  sendResponse(res, HTTPSTATUS.OK, table, "Table updated successfully");
};

// ================= DELETE TABLE =================

export const deleteTableController = async (req: Request, res: Response) => {
  await deleteTableService(
    req.params.restaurantId as string,
    req.params.tableId as string,
    req.user!._id.toString(),
  );

  sendResponse(res, HTTPSTATUS.OK, null, "Table deleted successfully");
};
