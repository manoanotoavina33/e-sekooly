"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoomRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const classroom_controller_1 = require("../controllers/classroom.controller");
const classroom_validation_1 = require("../validations/classroom.validation");
exports.classRoomRouter = (0, express_1.Router)();
exports.classRoomRouter.use(authenticate_1.authenticate);
exports.classRoomRouter.get("/", (0, authorize_1.authorize)("academics.read"), (0, validate_1.validateQuery)(classroom_validation_1.listClassRoomsQuerySchema), classroom_controller_1.classRoomController.list);
exports.classRoomRouter.get("/:id", (0, authorize_1.authorize)("academics.read"), classroom_controller_1.classRoomController.getById);
exports.classRoomRouter.post("/", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(classroom_validation_1.createClassRoomSchema), classroom_controller_1.classRoomController.create);
exports.classRoomRouter.patch("/:id", (0, authorize_1.authorize)("academics.manage"), (0, validate_1.validateBody)(classroom_validation_1.updateClassRoomSchema), classroom_controller_1.classRoomController.update);
exports.classRoomRouter.delete("/:id", (0, authorize_1.authorize)("academics.manage"), classroom_controller_1.classRoomController.remove);
//# sourceMappingURL=classroom.routes.js.map