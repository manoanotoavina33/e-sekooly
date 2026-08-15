"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const invoice_controller_1 = require("../controllers/invoice.controller");
const invoice_validation_1 = require("../validations/invoice.validation");
exports.invoiceRouter = (0, express_1.Router)();
exports.invoiceRouter.use(authenticate_1.authenticate);
exports.invoiceRouter.get("/", (0, authorize_1.authorize)("finance.read"), (0, validate_1.validateQuery)(invoice_validation_1.listInvoicesQuerySchema), invoice_controller_1.invoiceController.list);
exports.invoiceRouter.get("/summary", (0, authorize_1.authorize)("finance.read"), invoice_controller_1.invoiceController.summary);
exports.invoiceRouter.get("/:id", (0, authorize_1.authorize)("finance.read"), invoice_controller_1.invoiceController.getById);
exports.invoiceRouter.post("/", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(invoice_validation_1.createInvoiceSchema), invoice_controller_1.invoiceController.create);
//# sourceMappingURL=invoice.routes.js.map