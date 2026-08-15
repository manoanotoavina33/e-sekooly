"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const notification_controller_1 = require("../controllers/notification.controller");
const notification_validation_1 = require("../validations/notification.validation");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.use(authenticate_1.authenticate);
exports.notificationRouter.get("/me", (0, validate_1.validateQuery)(notification_validation_1.listNotificationsQuerySchema), notification_controller_1.notificationController.listMine);
exports.notificationRouter.patch("/:id/read", notification_controller_1.notificationController.markRead);
exports.notificationRouter.post("/read-all", notification_controller_1.notificationController.markAllRead);
exports.notificationRouter.post("/", (0, authorize_1.authorize)("communication.manage"), (0, validate_1.validateBody)(notification_validation_1.createNotificationSchema), notification_controller_1.notificationController.create);
//# sourceMappingURL=notification.routes.js.map