import { Router } from "express";
import authRoutes from "@/modules/auth/auth.route.js";
import restaurantRoutes from "@/modules/restaurant/restaurant.route.js";
import operatingHourRoutes from "@/modules/operating-hours/operatingHours.route.js";
import tableRoutes from "@/modules/table/table.route.js";
import bookingRoutes from "@/modules/booking/booking.route.js";

const apiRouter = Router();

apiRouter.use("/", authRoutes);

apiRouter.use("/restaurants", restaurantRoutes);

apiRouter.use("/restaurants/:restaurantId/hours", operatingHourRoutes);

apiRouter.use("/restaurants/:restaurantId/tables", tableRoutes);

apiRouter.use("/bookings", bookingRoutes);

export default apiRouter;
