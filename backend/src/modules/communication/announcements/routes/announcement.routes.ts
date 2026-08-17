import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { announcementController } from "../controllers/announcement.controller";
import { createAnnouncementSchema, listAnnouncementsQuerySchema, updateAnnouncementSchema } from "../validations/announcement.validation";

export const announcementRouter = Router();

announcementRouter.use(authenticate);

announcementRouter.get("/", validateQuery(listAnnouncementsQuerySchema), announcementController.list);
announcementRouter.get("/:id", announcementController.getById);
announcementRouter.post(
  "/",
  authorize("communication.manage"),
  validateBody(createAnnouncementSchema),
  announcementController.create
);
announcementRouter.patch(
  "/:id",
  authorize("communication.manage"),
  validateBody(updateAnnouncementSchema),
  announcementController.update
);
announcementRouter.delete(
  "/:id",
  authorize("communication.manage"),
  announcementController.delete
);
announcementRouter.get("/:id/pdf", announcementController.getPdf);
