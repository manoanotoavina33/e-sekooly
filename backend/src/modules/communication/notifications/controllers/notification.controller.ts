import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { notificationService } from "../services/notification.service";
import { CreateNotificationInput, ListNotificationsQuery } from "../validations/notification.validation";

export const notificationController = {
  listMine: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListNotificationsQuery;
    const notifications = await notificationService.listForUser(req.auth!.userId, query.unreadOnly);
    res.json({ success: true, data: notifications });
  }),

  markRead: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await notificationService.markRead(req.params.id, req.auth!.userId);
    res.json({ success: true });
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.auth!.userId);
    res.json({ success: true });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateNotificationInput>, res: Response) => {
    const notification = await notificationService.create(req.body);
    res.status(201).json({ success: true, data: notification });
  }),
};
