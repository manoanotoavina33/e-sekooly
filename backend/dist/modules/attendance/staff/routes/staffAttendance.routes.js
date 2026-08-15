"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffAttendanceRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const staffAttendance_controller_1 = require("../controllers/staffAttendance.controller");
const staffAttendance_validation_1 = require("../validations/staffAttendance.validation");
exports.staffAttendanceRouter = (0, express_1.Router)();
exports.staffAttendanceRouter.use(authenticate_1.authenticate);
exports.staffAttendanceRouter.get("/", (0, authorize_1.authorize)("attendance.read"), (0, validate_1.validateQuery)(staffAttendance_validation_1.listStaffAttendanceQuerySchema), staffAttendance_controller_1.staffAttendanceController.list);
exports.staffAttendanceRouter.post("/checkin", (0, authorize_1.authorize)("attendance.record"), (0, validate_1.validateBody)(staffAttendance_validation_1.staffCheckinSchema), staffAttendance_controller_1.staffAttendanceController.checkIn);
exports.staffAttendanceRouter.post("/checkout", (0, authorize_1.authorize)("attendance.record"), (0, validate_1.validateBody)(staffAttendance_validation_1.staffCheckoutSchema), staffAttendance_controller_1.staffAttendanceController.checkOut);
exports.staffAttendanceRouter.post("/bulk", (0, authorize_1.authorize)("attendance.record"), (0, validate_1.validateBody)(staffAttendance_validation_1.staffBulkAttendanceSchema), staffAttendance_controller_1.staffAttendanceController.bulkMark);
//# sourceMappingURL=staffAttendance.routes.js.map