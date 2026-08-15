"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const user_controller_1 = require("../controllers/user.controller");
const user_validation_1 = require("../validations/user.validation");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.use(authenticate_1.authenticate);
exports.userRouter.get("/", (0, authorize_1.authorize)("users.manage"), (0, validate_1.validateQuery)(user_validation_1.listUsersQuerySchema), user_controller_1.userController.list);
exports.userRouter.get("/roles", (0, authorize_1.authorize)("users.manage"), user_controller_1.userController.roles);
exports.userRouter.post("/", (0, authorize_1.authorize)("users.manage"), (0, validate_1.validateBody)(user_validation_1.createUserSchema), user_controller_1.userController.create);
exports.userRouter.patch("/:id", (0, authorize_1.authorize)("users.manage"), (0, validate_1.validateBody)(user_validation_1.updateUserSchema), user_controller_1.userController.update);
exports.userRouter.delete("/:id", (0, authorize_1.authorize)("users.manage"), user_controller_1.userController.delete);
//# sourceMappingURL=user.routes.js.map