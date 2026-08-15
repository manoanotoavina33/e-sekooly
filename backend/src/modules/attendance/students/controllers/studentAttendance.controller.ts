import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { studentAttendanceService } from "../services/studentAttendance.service";
import {
  AttendanceReportQuery,
  BulkAttendanceInput,
  CheckinByQrInput,
  ListAttendanceQuery,
} from "../validations/studentAttendance.validation";

export const studentAttendanceController = {
  checkinByQr: asyncHandler(async (req: Request<unknown, unknown, CheckinByQrInput>, res: Response) => {
    const record = await studentAttendanceService.checkinByQr(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: record });
  }),

  bulkMark: asyncHandler(async (req: Request<unknown, unknown, BulkAttendanceInput>, res: Response) => {
    const records = await studentAttendanceService.bulkMark(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: records });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const records = await studentAttendanceService.list(req.query as unknown as ListAttendanceQuery);
    res.json({ success: true, data: records });
  }),

  report: asyncHandler(async (req: Request, res: Response) => {
    const report = await studentAttendanceService.report(req.query as unknown as AttendanceReportQuery);
    res.json({ success: true, data: report });
  }),
};
