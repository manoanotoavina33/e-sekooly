"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const sync_controller_1 = require("../controllers/sync.controller");
const sync_validation_1 = require("../validations/sync.validation");
const zod_1 = require("zod");
exports.syncRouter = (0, express_1.Router)();
exports.syncRouter.use(authenticate_1.authenticate);
exports.syncRouter.get("/pull", (0, authorize_1.authorize)("sync.operate"), (0, validate_1.validateQuery)(sync_validation_1.pullQuerySchema), sync_controller_1.syncController.pull);
exports.syncRouter.post("/push", (0, authorize_1.authorize)("sync.operate"), (0, validate_1.validateBody)(sync_validation_1.pushBodySchema), sync_controller_1.syncController.push);
exports.syncRouter.get("/history", (0, authorize_1.authorize)("settings.manage"), (0, validate_1.validateQuery)(zod_1.z.object({ schoolId: zod_1.z.string().uuid() })), sync_controller_1.syncController.history);
//# sourceMappingURL=sync.routes.js.map