import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { announcementService } from "../services/announcement.service";
import { CreateAnnouncementInput, ListAnnouncementsQuery, UpdateAnnouncementInput } from "../validations/announcement.validation";
import { streamAnnouncementPdf } from "../utils/announcementPdf";

export const announcementController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const announcements = await announcementService.list(req.query as unknown as ListAnnouncementsQuery);
    res.json({ success: true, data: announcements });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const announcement = await announcementService.getById(req.params.id);
    res.json({ success: true, data: announcement });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateAnnouncementInput>, res: Response) => {
    const announcement = await announcementService.create(req.body, req.auth!.userId);
    res.status(201).json({ success: true, data: announcement });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateAnnouncementInput>, res: Response) => {
    const announcement = await announcementService.update(req.params.id, req.body);
    res.json({ success: true, data: announcement });
  }),

  delete: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await announcementService.delete(req.params.id);
    res.json({ success: true });
  }),

  getPdf: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const announcement = await announcementService.getById(req.params.id);
    await streamAnnouncementPdf(res, announcement);
  }),
};
