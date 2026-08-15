import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { cashSessionService } from "../services/cashSession.service";
import {
  CloseCashSessionInput,
  ListCashSessionsQuery,
  OpenCashSessionInput,
} from "../validations/cashSession.validation";

export const cashSessionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await cashSessionService.list(req.query as unknown as ListCashSessionsQuery);
    res.json({ success: true, data: sessions });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const session = await cashSessionService.getById(req.params.id);
    res.json({ success: true, data: session });
  }),

  open: asyncHandler(async (req: Request<unknown, unknown, OpenCashSessionInput>, res: Response) => {
    const session = await cashSessionService.open(req.body, req.auth!.userId);
    res.status(201).json({ success: true, data: session });
  }),

  close: asyncHandler(async (req: Request<{ id: string }, unknown, CloseCashSessionInput>, res: Response) => {
    const session = await cashSessionService.close(req.params.id, req.body.declaredClosingBalance, req.auth!.userId);
    res.json({ success: true, data: session });
  }),

  journal: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const { category, month, year, limit } = req.query as Record<string, string>;
    const entries = await cashSessionService.getJournal(req.params.id, {
      category: category || undefined,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      limit: limit ? Number(limit) : 10,
    });
    res.json({ success: true, data: entries });
  }),
};
