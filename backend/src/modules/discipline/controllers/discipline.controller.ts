import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { disciplineService } from "../services/discipline.service";
import { CreateDisciplineRecordInput, ListDisciplineQuery } from "../validations/discipline.validation";

export const disciplineController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const records = await disciplineService.list(req.query as unknown as ListDisciplineQuery);
    res.json({ success: true, data: records });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateDisciplineRecordInput>, res: Response) => {
    const record = await disciplineService.create(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: record });
  }),

  summary: asyncHandler(async (req: Request<{ studentId: string }>, res: Response) => {
    const summary = await disciplineService.summary(req.params.studentId);
    res.json({ success: true, data: summary });
  }),
};
