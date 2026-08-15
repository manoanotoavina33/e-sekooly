import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { staffAttendanceService } from "../services/staffAttendance.service";
import {
  ListStaffAttendanceQuery,
  StaffBulkAttendanceInput,
  StaffCheckinInput,
  StaffCheckoutInput,
} from "../validations/staffAttendance.validation";

export const staffAttendanceController = {
  checkIn: asyncHandler(async (req: Request<unknown, unknown, StaffCheckinInput>, res: Response) => {
    const record = await staffAttendanceService.checkIn(req.body);
    res.status(201).json({ success: true, data: record });
  }),

  checkOut: asyncHandler(async (req: Request<unknown, unknown, StaffCheckoutInput>, res: Response) => {
    const record = await staffAttendanceService.checkOut(req.body);
    res.json({ success: true, data: record });
  }),

  bulkMark: asyncHandler(async (req: Request<unknown, unknown, StaffBulkAttendanceInput>, res: Response) => {
    const records = await staffAttendanceService.bulkMark(req.body);
    res.status(201).json({ success: true, data: records });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const records = await staffAttendanceService.list(req.query as unknown as ListStaffAttendanceQuery);
    res.json({ success: true, data: records });
  }),
};
