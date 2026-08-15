import { Router } from "express";
import { authenticate } from "../../../core/middlewares/authenticate";
import { authorize } from "../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../core/middlewares/validate";
import { syncController } from "../controllers/sync.controller";
import { pullQuerySchema, pushBodySchema } from "../validations/sync.validation";
import { z } from "zod";

export const syncRouter = Router();

syncRouter.use(authenticate);

syncRouter.get("/pull", authorize("sync.operate"), validateQuery(pullQuerySchema), syncController.pull);
syncRouter.post("/push", authorize("sync.operate"), validateBody(pushBodySchema), syncController.push);
syncRouter.get(
  "/history",
  authorize("settings.manage"),
  validateQuery(z.object({ schoolId: z.string().uuid() })),
  syncController.history
);
