"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashTransactionRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const cashTransaction_controller_1 = require("../controllers/cashTransaction.controller");
const cashTransaction_validation_1 = require("../validations/cashTransaction.validation");
exports.cashTransactionRouter = (0, express_1.Router)();
exports.cashTransactionRouter.use(authenticate_1.authenticate);
exports.cashTransactionRouter.get("/", (0, authorize_1.authorize)("cashier.read"), (0, validate_1.validateQuery)(cashTransaction_validation_1.listCashTransactionsQuerySchema), cashTransaction_controller_1.cashTransactionController.list);
exports.cashTransactionRouter.post("/", (0, authorize_1.authorize)("cashier.operate"), (0, validate_1.validateBody)(cashTransaction_validation_1.createCashTransactionSchema), cashTransaction_controller_1.cashTransactionController.record);
exports.cashTransactionRouter.patch("/:id/validate", (0, authorize_1.authorize)("cashier.validate"), (0, validate_1.validateBody)(cashTransaction_validation_1.validateCashTransactionSchema), cashTransaction_controller_1.cashTransactionController.validate);
exports.cashTransactionRouter.get("/:id/receipt", (0, authorize_1.authorize)("cashier.read"), (0, validate_1.validateQuery)(cashTransaction_validation_1.receiptFormatQuerySchema), cashTransaction_controller_1.cashTransactionController.receiptPdf);
//# sourceMappingURL=cashTransaction.routes.js.map