import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { disciplineController } from "../controllers/discipline.controller";
import { createDisciplineRecordSchema, listDisciplineQuerySchema } from "../validations/discipline.validation";

export const disciplineRouter = Router();

disciplineRouter.use(authenticate);

disciplineRouter.get("/", authorize("discipline.read"), validateQuery(listDisciplineQuerySchema), disciplineController.list);
disciplineRouter.get("/students/:studentId/summary", authorize("discipline.read"), disciplineController.summary);
disciplineRouter.post("/", authorize("discipline.record"), validateBody(createDisciplineRecordSchema), disciplineController.create);
