import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { studentController } from "../controllers/student.controller";
import {
  changeClassSchema,
  createStudentSchema,
  listStudentsQuerySchema,
  suspendStudentSchema,
  updateStudentSchema,
} from "../validations/student.validation";

export const studentRouter = Router();

studentRouter.use(authenticate);

studentRouter.get("/", authorize("students.read"), validateQuery(listStudentsQuerySchema), studentController.list);
studentRouter.get("/:id", authorize("students.read"), studentController.getById);
studentRouter.post("/", authorize("students.create"), validateBody(createStudentSchema), studentController.create);
studentRouter.patch("/:id", authorize("students.update"), validateBody(updateStudentSchema), studentController.update);
studentRouter.post(
  "/:id/change-class",
  authorize("students.update"),
  validateBody(changeClassSchema),
  studentController.changeClass
);
studentRouter.post(
  "/:id/suspend",
  authorize("students.discipline"),
  validateBody(suspendStudentSchema),
  studentController.suspend
);
studentRouter.post("/:id/reactivate", authorize("students.discipline"), studentController.reactivate);
studentRouter.delete("/:id", authorize("students.delete"), studentController.delete);
