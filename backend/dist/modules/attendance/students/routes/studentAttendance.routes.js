"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAttendanceRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const studentAttendance_controller_1 = require("../controllers/studentAttendance.controller");
const studentAttendance_validation_1 = require("../validations/studentAttendance.validation");
exports.studentAttendanceRouter = (0, express_1.Router)();
exports.studentAttendanceRouter.use(authenticate_1.authenticate);
exports.studentAttendanceRouter.get("/", (0, authorize_1.authorize)("attendance.read"), (0, validate_1.validateQuery)(studentAttendance_validation_1.listAttendanceQuerySchema), studentAttendance_controller_1.studentAttendanceController.list);
exports.studentAttendanceRouter.get("/report", (0, authorize_1.authorize)("attendance.read"), (0, validate_1.validateQuery)(studentAttendance_validation_1.listAttendanceQuerySchema), studentAttendance_controller_1.studentAttendanceController.report);
exports.studentAttendanceRouter.post("/checkin", (0, authorize_1.authorize)("attendance.record"), (0, validate_1.validateBody)(studentAttendance_validation_1.checkinByQrSchema), studentAttendance_controller_1.studentAttendanceController.checkinByQr);
exports.studentAttendanceRouter.post("/bulk", (0, authorize_1.authorize)("attendance.record"), (0, validate_1.validateBody)(studentAttendance_validation_1.bulkAttendanceSchema), studentAttendance_controller_1.studentAttendanceController.bulkMark);
//# sourceMappingURL=studentAttendance.routes.js.map