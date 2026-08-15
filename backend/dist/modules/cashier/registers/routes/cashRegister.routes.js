"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashRegisterRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const cashRegister_controller_1 = require("../controllers/cashRegister.controller");
const cashRegister_validation_1 = require("../validations/cashRegister.validation");
exports.cashRegisterRouter = (0, express_1.Router)();
exports.cashRegisterRouter.use(authenticate_1.authenticate);
exports.cashRegisterRouter.get("/", (0, authorize_1.authorize)("cashier.read"), (0, validate_1.validateQuery)(cashRegister_validation_1.listCashRegistersQuerySchema), cashRegister_controller_1.cashRegisterController.list);
exports.cashRegisterRouter.post("/", (0, authorize_1.authorize)("cashier.manage"), (0, validate_1.validateBody)(cashRegister_validation_1.createCashRegisterSchema), cashRegister_controller_1.cashRegisterController.create);
//# sourceMappingURL=cashRegister.routes.js.map