import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { gradeController } from "../controllers/grade.controller";
import { bulkGradesSchema, listGradesQuerySchema } from "../validations/grade.validation";

export const gradeRouter = Router();

gradeRouter.use(authenticate);

gradeRouter.get("/", authorize("grades.read"), validateQuery(listGradesQuerySchema), gradeController.list);
gradeRouter.post("/bulk", authorize("grades.record"), validateBody(bulkGradesSchema), gradeController.bulkSave);
