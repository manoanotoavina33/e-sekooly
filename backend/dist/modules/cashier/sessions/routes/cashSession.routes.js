"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashSessionRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const cashSession_controller_1 = require("../controllers/cashSession.controller");
const cashSession_validation_1 = require("../validations/cashSession.validation");
exports.cashSessionRouter = (0, express_1.Router)();
exports.cashSessionRouter.use(authenticate_1.authenticate);
exports.cashSessionRouter.get("/", (0, authorize_1.authorize)("cashier.read"), (0, validate_1.validateQuery)(cashSession_validation_1.listCashSessionsQuerySchema), cashSession_controller_1.cashSessionController.list);
exports.cashSessionRouter.get("/:id", (0, authorize_1.authorize)("cashier.read"), cashSession_controller_1.cashSessionController.getById);
exports.cashSessionRouter.get("/:id/journal", (0, authorize_1.authorize)("cashier.read"), cashSession_controller_1.cashSessionController.journal);
exports.cashSessionRouter.post("/open", (0, authorize_1.authorize)("cashier.operate"), (0, validate_1.validateBody)(cashSession_validation_1.openCashSessionSchema), cashSession_controller_1.cashSessionController.open);
exports.cashSessionRouter.post("/:id/close", (0, authorize_1.authorize)("cashier.operate"), (0, validate_1.validateBody)(cashSession_validation_1.closeCashSessionSchema), cashSession_controller_1.cashSessionController.close);
//# sourceMappingURL=cashSession.routes.js.map