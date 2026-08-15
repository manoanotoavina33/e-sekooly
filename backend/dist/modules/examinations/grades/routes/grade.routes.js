"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const grade_controller_1 = require("../controllers/grade.controller");
const grade_validation_1 = require("../validations/grade.validation");
exports.gradeRouter = (0, express_1.Router)();
exports.gradeRouter.use(authenticate_1.authenticate);
exports.gradeRouter.get("/", (0, authorize_1.authorize)("grades.read"), (0, validate_1.validateQuery)(grade_validation_1.listGradesQuerySchema), grade_controller_1.gradeController.list);
exports.gradeRouter.post("/bulk", (0, authorize_1.authorize)("grades.record"), (0, validate_1.validateBody)(grade_validation_1.bulkGradesSchema), grade_controller_1.gradeController.bulkSave);
//# sourceMappingURL=grade.routes.js.map