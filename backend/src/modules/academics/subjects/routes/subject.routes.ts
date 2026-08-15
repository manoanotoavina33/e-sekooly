import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { subjectController } from "../controllers/subject.controller";
import { createSubjectSchema, listSubjectsQuerySchema, updateSubjectSchema } from "../validations/subject.validation";

export const subjectRouter = Router();

subjectRouter.use(authenticate);

subjectRouter.get("/", authorize("academics.read"), validateQuery(listSubjectsQuerySchema), subjectController.list);
subjectRouter.get("/:id", authorize("academics.read"), subjectController.getById);
subjectRouter.post("/", authorize("academics.manage"), validateBody(createSubjectSchema), subjectController.create);
subjectRouter.patch("/:id", authorize("academics.manage"), validateBody(updateSubjectSchema), subjectController.update);
subjectRouter.delete("/:id", authorize("academics.manage"), subjectController.remove);
