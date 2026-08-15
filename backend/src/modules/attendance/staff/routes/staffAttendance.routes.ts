import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { staffAttendanceController } from "../controllers/staffAttendance.controller";
import {
  listStaffAttendanceQuerySchema,
  staffBulkAttendanceSchema,
  staffCheckinSchema,
  staffCheckoutSchema,
} from "../validations/staffAttendance.validation";

export const staffAttendanceRouter = Router();

staffAttendanceRouter.use(authenticate);

staffAttendanceRouter.get(
  "/",
  authorize("attendance.read"),
  validateQuery(listStaffAttendanceQuerySchema),
  staffAttendanceController.list
);
staffAttendanceRouter.post(
  "/checkin",
  authorize("attendance.record"),
  validateBody(staffCheckinSchema),
  staffAttendanceController.checkIn
);
staffAttendanceRouter.post(
  "/checkout",
  authorize("attendance.record"),
  validateBody(staffCheckoutSchema),
  staffAttendanceController.checkOut
);
staffAttendanceRouter.post(
  "/bulk",
  authorize("attendance.record"),
  validateBody(staffBulkAttendanceSchema),
  staffAttendanceController.bulkMark
);
