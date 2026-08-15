import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { timetableService } from "../services/timetable.service";
import {
  CreateTimetableSlotInput,
  ListTimetableQuery,
  UpdateTimetableSlotInput,
} from "../validations/timetable.validation";
import { streamTimetablePdf } from "../utils/timetablePdf";

export const timetableController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const slots = await timetableService.list(req.query as unknown as ListTimetableQuery, req.auth!);
    res.json({ success: true, data: slots });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateTimetableSlotInput>, res: Response) => {
    const slot = await timetableService.create(req.body);
    res.status(201).json({ success: true, data: slot });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateTimetableSlotInput>, res: Response) => {
    const slot = await timetableService.update(req.params.id, req.body);
    res.json({ success: true, data: slot });
  }),

  remove: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await timetableService.remove(req.params.id);
    res.status(204).send();
  }),

  exportPdf: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListTimetableQuery;
    const slots = await timetableService.list(query, req.auth!);
    const title = query.classRoomId
      ? `Emploi du temps — ${slots[0]?.classRoom.name ?? ""}`
      : query.teacherId
      ? `Emploi du temps — ${slots[0] ? slots[0].teacher.user.firstName + " " + slots[0].teacher.user.lastName : ""}`
      : "Emploi du temps général";
    streamTimetablePdf(res, title, slots as never);
  }),
};
