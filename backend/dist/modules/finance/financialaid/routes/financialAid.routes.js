"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAidRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const financialAid_controller_1 = require("../controllers/financialAid.controller");
const financialAid_validation_1 = require("../validations/financialAid.validation");
exports.financialAidRouter = (0, express_1.Router)();
exports.financialAidRouter.use(authenticate_1.authenticate);
exports.financialAidRouter.get("/", (0, authorize_1.authorize)("finance.read"), (0, validate_1.validateQuery)(financialAid_validation_1.listFinancialAidQuerySchema), financialAid_controller_1.financialAidController.list);
exports.financialAidRouter.post("/", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(financialAid_validation_1.createFinancialAidSchema), financialAid_controller_1.financialAidController.create);
//# sourceMappingURL=financialAid.routes.js.map