"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const account_controller_1 = require("../controllers/account.controller");
const account_validation_1 = require("../validations/account.validation");
exports.accountRouter = (0, express_1.Router)();
exports.accountRouter.use(authenticate_1.authenticate);
exports.accountRouter.get("/", (0, authorize_1.authorize)("accounting.read"), (0, validate_1.validateQuery)(account_validation_1.listAccountsQuerySchema), account_controller_1.accountController.list);
exports.accountRouter.post("/", (0, authorize_1.authorize)("accounting.manage"), (0, validate_1.validateBody)(account_validation_1.createAccountSchema), account_controller_1.accountController.create);
//# sourceMappingURL=account.routes.js.map