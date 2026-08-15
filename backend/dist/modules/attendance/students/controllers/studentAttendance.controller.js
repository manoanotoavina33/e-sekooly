"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAttendanceController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const studentAttendance_service_1 = require("../services/studentAttendance.service");
exports.studentAttendanceController = {
    checkinByQr: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const record = await studentAttendance_service_1.studentAttendanceService.checkinByQr(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: record });
    }),
    bulkMark: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const records = await studentAttendance_service_1.studentAttendanceService.bulkMark(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: records });
    }),
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const records = await studentAttendance_service_1.studentAttendanceService.list(req.query);
        res.json({ success: true, data: records });
    }),
    report: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const report = await studentAttendance_service_1.studentAttendanceService.report(req.query);
        res.json({ success: true, data: report });
    }),
};
//# sourceMappingURL=studentAttendance.controller.js.map