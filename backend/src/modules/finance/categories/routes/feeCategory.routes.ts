import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { feeCategoryController } from "../controllers/feeCategory.controller";
import { createFeeCategorySchema, listFeeCategoriesQuerySchema } from "../validations/feeCategory.validation";

export const feeCategoryRouter = Router();

feeCategoryRouter.use(authenticate);

feeCategoryRouter.get("/", authorize("finance.read"), validateQuery(listFeeCategoriesQuerySchema), feeCategoryController.list);
feeCategoryRouter.post("/", authorize("finance.manage"), validateBody(createFeeCategorySchema), feeCategoryController.create);
