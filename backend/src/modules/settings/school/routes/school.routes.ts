import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody } from "../../../../core/middlewares/validate";
import { schoolController } from "../controllers/school.controller";
import {
  createSchoolYearSchema,
  createSemesterSchema,
  updateSchoolSchema,
  upsertSystemSettingSchema,
} from "../validations/school.validation";

export const schoolRouter = Router();

schoolRouter.use(authenticate);

schoolRouter.get("/:id", authorize("settings.read"), schoolController.getById);
schoolRouter.patch("/:id", authorize("settings.manage"), validateBody(updateSchoolSchema), schoolController.update);

schoolRouter.post(
  "/school-years",
  authorize("settings.manage"),
  validateBody(createSchoolYearSchema),
  schoolController.createSchoolYear
);
schoolRouter.post("/:id/school-years/:yearId/set-current", authorize("settings.manage"), schoolController.setCurrentSchoolYear);

schoolRouter.post(
  "/semesters",
  authorize("settings.manage"),
  validateBody(createSemesterSchema),
  schoolController.createSemester
);

schoolRouter.get("/:id/settings", authorize("settings.read"), schoolController.listSettings);
schoolRouter.put(
  "/settings",
  authorize("settings.manage"),
  validateBody(upsertSystemSettingSchema),
  schoolController.upsertSetting
);
