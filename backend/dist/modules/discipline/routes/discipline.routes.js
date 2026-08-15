"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplineRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const discipline_controller_1 = require("../controllers/discipline.controller");
const discipline_validation_1 = require("../validations/discipline.validation");
exports.disciplineRouter = (0, express_1.Router)();
exports.disciplineRouter.use(authenticate_1.authenticate);
exports.disciplineRouter.get("/", (0, authorize_1.authorize)("discipline.read"), (0, validate_1.validateQuery)(discipline_validation_1.listDisciplineQuerySchema), discipline_controller_1.disciplineController.list);
exports.disciplineRouter.get("/students/:studentId/summary", (0, authorize_1.authorize)("discipline.read"), discipline_controller_1.disciplineController.summary);
exports.disciplineRouter.post("/", (0, authorize_1.authorize)("discipline.record"), (0, validate_1.validateBody)(discipline_validation_1.createDisciplineRecordSchema), discipline_controller_1.disciplineController.create);
//# sourceMappingURL=discipline.routes.js.map