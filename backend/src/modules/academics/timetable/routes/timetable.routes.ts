import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { timetableController } from "../controllers/timetable.controller";
import {
  createTimetableSlotSchema,
  listTimetableQuerySchema,
  updateTimetableSlotSchema,
} from "../validations/timetable.validation";

export const timetableRouter = Router();

timetableRouter.use(authenticate);

timetableRouter.get("/", authorize("academics.read"), validateQuery(listTimetableQuerySchema), timetableController.list);
timetableRouter.get(
  "/export/pdf",
  authorize("academics.read"),
  validateQuery(listTimetableQuerySchema),
  timetableController.exportPdf
);
timetableRouter.post(
  "/",
  authorize("academics.manage"),
  validateBody(createTimetableSlotSchema),
  timetableController.create
);
timetableRouter.patch(
  "/:id",
  authorize("academics.manage"),
  validateBody(updateTimetableSlotSchema),
  timetableController.update
);
timetableRouter.delete("/:id", authorize("academics.manage"), timetableController.remove);
