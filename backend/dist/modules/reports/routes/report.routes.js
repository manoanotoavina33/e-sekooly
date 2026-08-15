"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const report_controller_1 = require("../controllers/report.controller");
const report_validation_1 = require("../validations/report.validation");
exports.reportRouter = (0, express_1.Router)();
exports.reportRouter.use(authenticate_1.authenticate);
exports.reportRouter.get("/", (0, authorize_1.authorize)("reports.read"), report_controller_1.reportController.list);
exports.reportRouter.get("/:id/export", (0, authorize_1.authorize)("reports.read"), (0, validate_1.validateQuery)(report_validation_1.exportReportQuerySchema), report_controller_1.reportController.export);
//# sourceMappingURL=report.routes.js.map