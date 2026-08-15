import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { cashSessionController } from "../controllers/cashSession.controller";
import {
  closeCashSessionSchema,
  listCashSessionsQuerySchema,
  openCashSessionSchema,
} from "../validations/cashSession.validation";

export const cashSessionRouter = Router();

cashSessionRouter.use(authenticate);

cashSessionRouter.get("/", authorize("cashier.read"), validateQuery(listCashSessionsQuerySchema), cashSessionController.list);
cashSessionRouter.get("/:id", authorize("cashier.read"), cashSessionController.getById);
cashSessionRouter.get("/:id/journal", authorize("cashier.read"), cashSessionController.journal);
cashSessionRouter.post("/open", authorize("cashier.operate"), validateBody(openCashSessionSchema), cashSessionController.open);
cashSessionRouter.post(
  "/:id/close",
  authorize("cashier.operate"),
  validateBody(closeCashSessionSchema),
  cashSessionController.close
);
