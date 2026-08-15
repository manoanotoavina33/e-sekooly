import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { announcementService } from "../services/announcement.service";
import { CreateAnnouncementInput, ListAnnouncementsQuery } from "../validations/announcement.validation";

export const announcementController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const announcements = await announcementService.list(req.query as unknown as ListAnnouncementsQuery);
    res.json({ success: true, data: announcements });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateAnnouncementInput>, res: Response) => {
    const announcement = await announcementService.create(req.body, req.auth!.userId);
    res.status(201).json({ success: true, data: announcement });
  }),
};
