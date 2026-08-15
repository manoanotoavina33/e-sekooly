"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const subject_controller_1 = require("../controllers/subject.controller");
const subject_validation_1 = require("../validations/subject.validation");
exports.subjectRouter = (0, express_1.Router)();
exports.subjectRouter.use(authenticate_1.authenticate);
exports.subjectRouter.get("/", (0, authorize_1.authorize)("academics.read"), (0, validate_1.validateQuery)(subject_validation_1.listSubjectsQuerySchema), subject_controller_1.subjectController.list);
exports.subjectRouter.get("/:id", (0, authorize_1.authorize)("academics.read"), subject_controller_1.subjectController.getById);
exports.subjectRouter.post("/", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(subject_validation_1.createSubjectSchema), subject_controller_1.subjectController.create);
exports.subjectRouter.patch("/:id", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(subject_validation_1.updateSubjectSchema), subject_controller_1.subjectController.update);
exports.subjectRouter.delete("/:id", (0, authorize_1.authorize)("academics.manage"), subject_controller_1.subjectController.remove);
//# sourceMappingURL=subject.routes.js.map