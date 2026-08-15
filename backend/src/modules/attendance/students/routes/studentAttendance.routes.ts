import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { studentAttendanceController } from "../controllers/studentAttendance.controller";
import {
  bulkAttendanceSchema,
  checkinByQrSchema,
  listAttendanceQuerySchema,
} from "../validations/studentAttendance.validation";

export const studentAttendanceRouter = Router();

studentAttendanceRouter.use(authenticate);

studentAttendanceRouter.get(
  "/",
  authorize("attendance.read"),
  validateQuery(listAttendanceQuerySchema),
  studentAttendanceController.list
);
studentAttendanceRouter.get(
  "/report",
  authorize("attendance.read"),
  validateQuery(listAttendanceQuerySchema),
  studentAttendanceController.report
);
studentAttendanceRouter.post(
  "/checkin",
  authorize("attendance.record"),
  validateBody(checkinByQrSchema),
  studentAttendanceController.checkinByQr
);
studentAttendanceRouter.post(
  "/bulk",
  authorize("attendance.record"),
  validateBody(bulkAttendanceSchema),
  studentAttendanceController.bulkMark
);
