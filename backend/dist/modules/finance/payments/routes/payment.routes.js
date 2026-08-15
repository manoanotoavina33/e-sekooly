"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const payment_controller_1 = require("../controllers/payment.controller");
const payment_validation_1 = require("../validations/payment.validation");
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.use(authenticate_1.authenticate);
exports.paymentRouter.get("/", (0, authorize_1.authorize)("finance.read"), (0, validate_1.validateQuery)(payment_validation_1.listPaymentsQuerySchema), payment_controller_1.paymentController.list);
exports.paymentRouter.get("/students-status", (0, authorize_1.authorize)("finance.read"), payment_controller_1.paymentController.studentStatus);
exports.paymentRouter.post("/", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(payment_validation_1.createPaymentSchema), payment_controller_1.paymentController.record);
exports.paymentRouter.post("/quick", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(payment_validation_1.quickPaymentSchema), payment_controller_1.paymentController.quickRecord);
exports.paymentRouter.get("/:id/receipt", (0, authorize_1.authorize)("finance.read"), payment_controller_1.paymentController.receiptPdf);
//# sourceMappingURL=payment.routes.js.map