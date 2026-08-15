import { Router } from "express";
import { authenticate } from "../../../../core/middlewares/authenticate";
import { authorize } from "../../../../core/middlewares/authorize";
import { validateBody, validateQuery } from "../../../../core/middlewares/validate";
import { notificationController } from "../controllers/notification.controller";
import { createNotificationSchema, listNotificationsQuerySchema } from "../validations/notification.validation";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/me", validateQuery(listNotificationsQuerySchema), notificationController.listMine);
notificationRouter.patch("/:id/read", notificationController.markRead);
notificationRouter.post("/read-all", notificationController.markAllRead);
notificationRouter.post(
  "/",
  authorize("communication.manage"),
  validateBody(createNotificationSchema),
  notificationController.create
);
