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
import { upload } from "../../../../core/middlewares/upload";

export const schoolRouter = Router();

schoolRouter.use(authenticate);

schoolRouter.get("/", authorize("settings.read"), schoolController.list);
schoolRouter.get("/:id", authorize("settings.read"), schoolController.getById);
schoolRouter.patch("/:id", authorize("settings.manage"), validateBody(updateSchoolSchema), schoolController.update);
schoolRouter.post("/:id/upload-logo", authorize("settings.manage"), upload.single("logo"), schoolController.uploadLogo);

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
schoolRouter.get("/categories", authorize("settings.read"), schoolController.listCategories);
schoolRouter.put(
  "/settings",
  authorize("settings.manage"),
  validateBody(upsertSystemSettingSchema),
  schoolController.upsertSetting
);
