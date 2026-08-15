import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { invoiceController } from "../controllers/invoice.controller";
import { createInvoiceSchema, listInvoicesQuerySchema } from "../validations/invoice.validation";

export const invoiceRouter = Router();

invoiceRouter.use(authenticate);

invoiceRouter.get("/", authorize("finance.read"), validateQuery(listInvoicesQuerySchema), invoiceController.list);
invoiceRouter.get("/summary", authorize("finance.read"), invoiceController.summary);
invoiceRouter.get("/:id", authorize("finance.read"), invoiceController.getById);
invoiceRouter.post("/", authorize("finance.manage"), validateBody(createInvoiceSchema), invoiceController.create);
