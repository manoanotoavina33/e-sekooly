import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { cashTransactionController } from "../controllers/cashTransaction.controller";
import {
  createCashTransactionSchema,
  listCashTransactionsQuerySchema,
  receiptFormatQuerySchema,
  validateCashTransactionSchema,
} from "../validations/cashTransaction.validation";

export const cashTransactionRouter = Router();

cashTransactionRouter.use(authenticate);

cashTransactionRouter.get(
  "/",
  authorize("cashier.read"),
  validateQuery(listCashTransactionsQuerySchema),
  cashTransactionController.list
);
cashTransactionRouter.post(
  "/",
  authorize("cashier.operate"),
  validateBody(createCashTransactionSchema),
  cashTransactionController.record
);
cashTransactionRouter.patch(
  "/:id/validate",
  authorize("cashier.validate"),
  validateBody(validateCashTransactionSchema),
  cashTransactionController.validate
);
cashTransactionRouter.get(
  "/:id/receipt",
  authorize("cashier.read"),
  validateQuery(receiptFormatQuerySchema),
  cashTransactionController.receiptPdf
);
