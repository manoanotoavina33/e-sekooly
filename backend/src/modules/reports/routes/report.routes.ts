import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateQuery } from "../../../core/middlewares/validate";
import { reportController } from "../controllers/report.controller";
import { exportReportQuerySchema } from "../validations/report.validation";

export const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.get("/", authorize("reports.read"), reportController.list);
reportRouter.get("/:id/export", authorize("reports.read"), validateQuery(exportReportQuerySchema), reportController.export);
