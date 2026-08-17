"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const announcement_controller_1 = require("../controllers/announcement.controller");
const announcement_validation_1 = require("../validations/announcement.validation");
exports.announcementRouter = (0, express_1.Router)();
exports.announcementRouter.use(authenticate_1.authenticate);
exports.announcementRouter.get("/", (0, validate_1.validateQuery)(announcement_validation_1.listAnnouncementsQuerySchema), announcement_controller_1.announcementController.list);
exports.announcementRouter.get("/:id", announcement_controller_1.announcementController.getById);
exports.announcementRouter.post("/", (0, authorize_1.authorize)("communication.manage"), (0, validate_1.validateBody)(announcement_validation_1.createAnnouncementSchema), announcement_controller_1.announcementController.create);
exports.announcementRouter.patch("/:id", (0, authorize_1.authorize)("communication.manage"), (0, validate_1.validateBody)(announcement_validation_1.updateAnnouncementSchema), announcement_controller_1.announcementController.update);
exports.announcementRouter.delete("/:id", (0, authorize_1.authorize)("communication.manage"), announcement_controller_1.announcementController.delete);
exports.announcementRouter.get("/:id/pdf", announcement_controller_1.announcementController.getPdf);
//# sourceMappingURL=announcement.routes.js.map