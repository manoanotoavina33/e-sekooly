"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const exam_controller_1 = require("../controllers/exam.controller");
const exam_validation_1 = require("../validations/exam.validation");
exports.examRouter = (0, express_1.Router)();
exports.examRouter.use(authenticate_1.authenticate);
exports.examRouter.get("/sessions", (0, authorize_1.authorize)("exams.read"), (0, validate_1.validateQuery)(exam_validation_1.listExamSessionsQuerySchema), exam_controller_1.examController.listSessions);
exports.examRouter.get("/sessions/:id", (0, authorize_1.authorize)("exams.read"), exam_controller_1.examController.getSessionById);
exports.examRouter.post("/sessions", (0, authorize_1.authorize)("exams.manage"), (0, validate_1.validateBody)(exam_validation_1.createExamSessionSchema), exam_controller_1.examController.createSession);
exports.examRouter.patch("/sessions/:id/deliberation", (0, authorize_1.authorize)("exams.manage"), (0, validate_1.validateBody)(exam_validation_1.validateDeliberationSchema), exam_controller_1.examController.validateDeliberation);
exports.examRouter.get("/", (0, authorize_1.authorize)("exams.read"), (0, validate_1.validateQuery)(exam_validation_1.listExamsQuerySchema), exam_controller_1.examController.listExams);
exports.examRouter.get("/:id", (0, authorize_1.authorize)("exams.read"), exam_controller_1.examController.getExamById);
exports.examRouter.post("/", (0, authorize_1.authorize)("exams.manage"), (0, validate_1.validateBody)(exam_validation_1.createExamSchema), exam_controller_1.examController.createExam);
//# sourceMappingURL=exam.routes.js.map