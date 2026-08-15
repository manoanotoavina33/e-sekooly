import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { financialAidController } from "../controllers/financialAid.controller";
import { createFinancialAidSchema, listFinancialAidQuerySchema } from "../validations/financialAid.validation";

export const financialAidRouter = Router();

financialAidRouter.use(authenticate);

financialAidRouter.get("/", authorize("finance.read"), validateQuery(listFinancialAidQuerySchema), financialAidController.list);
financialAidRouter.post("/", authorize("finance.manage"), validateBody(createFinancialAidSchema), financialAidController.create);
