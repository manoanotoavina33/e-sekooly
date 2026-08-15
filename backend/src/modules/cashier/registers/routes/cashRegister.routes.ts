import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { cashRegisterController } from "../controllers/cashRegister.controller";
import { createCashRegisterSchema, listCashRegistersQuerySchema } from "../validations/cashRegister.validation";

export const cashRegisterRouter = Router();

cashRegisterRouter.use(authenticate);

cashRegisterRouter.get("/", authorize("cashier.read"), validateQuery(listCashRegistersQuerySchema), cashRegisterController.list);
cashRegisterRouter.post("/", authorize("cashier.manage"), validateBody(createCashRegisterSchema), cashRegisterController.create);
