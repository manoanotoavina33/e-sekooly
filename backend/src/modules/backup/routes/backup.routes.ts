import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { backupController } from "../controllers/backup.controller";
import { createBackupSchema, listBackupsQuerySchema, restoreBackupSchema } from "../validations/backup.validation";

export const backupRouter = Router();

backupRouter.use(authenticate);

backupRouter.get("/", authorize("settings.manage"), validateQuery(listBackupsQuerySchema), backupController.list);
backupRouter.post("/", authorize("settings.manage"), validateBody(createBackupSchema), backupController.create);
backupRouter.post("/restore", authorize("settings.manage"), validateBody(restoreBackupSchema), backupController.restore);
