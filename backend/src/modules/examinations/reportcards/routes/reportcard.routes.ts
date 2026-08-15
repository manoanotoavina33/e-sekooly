import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { reportCardController } from "../controllers/reportcard.controller";

export const reportCardRouter = Router();

reportCardRouter.use(authenticate);

reportCardRouter.get("/:examSessionId/:studentId", authorize("grades.read"), reportCardController.get);
reportCardRouter.get("/:examSessionId/:studentId/pdf", authorize("grades.read"), reportCardController.getPdf);
