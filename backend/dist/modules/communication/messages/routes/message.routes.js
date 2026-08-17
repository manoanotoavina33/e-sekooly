"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const validate_1 = require("../../../../core/middlewares/validate");
const message_controller_1 = require("../controllers/message.controller");
const message_validation_1 = require("../validations/message.validation");
exports.messageRouter = (0, express_1.Router)();
exports.messageRouter.use(authenticate_1.authenticate);
exports.messageRouter.get("/inbox", message_controller_1.messageController.inbox);
exports.messageRouter.get("/sent", message_controller_1.messageController.sent);
exports.messageRouter.post("/", (0, validate_1.validateBody)(message_validation_1.sendMessageSchema), message_controller_1.messageController.send);
exports.messageRouter.get("/:id", message_controller_1.messageController.getById);
exports.messageRouter.patch("/:id", (0, validate_1.validateBody)(message_validation_1.updateMessageSchema), message_controller_1.messageController.update);
exports.messageRouter.delete("/:id", message_controller_1.messageController.delete);
exports.messageRouter.patch("/:id/read", message_controller_1.messageController.markRead);
//# sourceMappingURL=message.routes.js.map