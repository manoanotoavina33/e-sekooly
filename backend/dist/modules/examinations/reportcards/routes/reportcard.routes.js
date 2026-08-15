"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCardRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const reportcard_controller_1 = require("../controllers/reportcard.controller");
exports.reportCardRouter = (0, express_1.Router)();
exports.reportCardRouter.use(authenticate_1.authenticate);
exports.reportCardRouter.get("/:examSessionId/:studentId", (0, authorize_1.authorize)("grades.read"), reportcard_controller_1.reportCardController.get);
exports.reportCardRouter.get("/:examSessionId/:studentId/pdf", (0, authorize_1.authorize)("grades.read"), reportcard_controller_1.reportCardController.getPdf);
//# sourceMappingURL=reportcard.routes.js.map