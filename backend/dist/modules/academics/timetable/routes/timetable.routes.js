"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timetableRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const timetable_controller_1 = require("../controllers/timetable.controller");
const timetable_validation_1 = require("../validations/timetable.validation");
exports.timetableRouter = (0, express_1.Router)();
exports.timetableRouter.use(authenticate_1.authenticate);
exports.timetableRouter.get("/", (0, authorize_1.authorize)("academics.read"), (0, validate_1.validateQuery)(timetable_validation_1.listTimetableQuerySchema), timetable_controller_1.timetableController.list);
exports.timetableRouter.get("/export/pdf", (0, authorize_1.authorize)("academics.read"), (0, validate_1.validateQuery)(timetable_validation_1.listTimetableQuerySchema), timetable_controller_1.timetableController.exportPdf);
exports.timetableRouter.post("/", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(timetable_validation_1.createTimetableSlotSchema), timetable_controller_1.timetableController.create);
exports.timetableRouter.patch("/:id", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(timetable_validation_1.updateTimetableSlotSchema), timetable_controller_1.timetableController.update);
exports.timetableRouter.delete("/:id", (0, authorize_1.authorize)("academics.manage"), timetable_controller_1.timetableController.remove);
//# sourceMappingURL=timetable.routes.js.map