import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { paymentController } from "../controllers/payment.controller";
import { createPaymentSchema, listPaymentsQuerySchema, quickPaymentSchema } from "../validations/payment.validation";

export const paymentRouter = Router();

paymentRouter.use(authenticate);

paymentRouter.get("/", authorize("finance.read"), validateQuery(listPaymentsQuerySchema), paymentController.list);
paymentRouter.get("/students-status", authorize("finance.read"), paymentController.studentStatus);
paymentRouter.post("/", authorize("finance.manage"), validateBody(createPaymentSchema), paymentController.record);
paymentRouter.post("/quick", authorize("finance.manage"), validateBody(quickPaymentSchema), paymentController.quickRecord);
paymentRouter.get("/:id/receipt", authorize("finance.read"), paymentController.receiptPdf);
