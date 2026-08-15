import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { examController } from "../controllers/exam.controller";
import {
  createExamSchema,
  createExamSessionSchema,
  listExamSessionsQuerySchema,
  listExamsQuerySchema,
  validateDeliberationSchema,
} from "../validations/exam.validation";

export const examRouter = Router();

examRouter.use(authenticate);

examRouter.get("/sessions", authorize("exams.read"), validateQuery(listExamSessionsQuerySchema), examController.listSessions);
examRouter.get("/sessions/:id", authorize("exams.read"), examController.getSessionById);
examRouter.post("/sessions", authorize("exams.manage"), validateBody(createExamSessionSchema), examController.createSession);
examRouter.patch(
  "/sessions/:id/deliberation",
  authorize("exams.manage"),
  validateBody(validateDeliberationSchema),
  examController.validateDeliberation
);

examRouter.get("/", authorize("exams.read"), validateQuery(listExamsQuerySchema), examController.listExams);
examRouter.get("/:id", authorize("exams.read"), examController.getExamById);
examRouter.post("/", authorize("exams.manage"), validateBody(createExamSchema), examController.createExam);
