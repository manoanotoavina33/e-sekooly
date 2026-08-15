"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffAttendanceController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const staffAttendance_service_1 = require("../services/staffAttendance.service");
exports.staffAttendanceController = {
    checkIn: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const record = await staffAttendance_service_1.staffAttendanceService.checkIn(req.body);
        res.status(201).json({ success: true, data: record });
    }),
    checkOut: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const record = await staffAttendance_service_1.staffAttendanceService.checkOut(req.body);
        res.json({ success: true, data: record });
    }),
    bulkMark: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const records = await staffAttendance_service_1.staffAttendanceService.bulkMark(req.body);
        res.status(201).json({ success: true, data: records });
    }),
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const records = await staffAttendance_service_1.staffAttendanceService.list(req.query);
        res.json({ success: true, data: records });
    }),
};
//# sourceMappingURL=staffAttendance.controller.js.map