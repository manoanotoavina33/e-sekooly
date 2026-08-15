import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { syncService } from "../services/sync.service";
import { PullQuery, PushBody } from "../validations/sync.validation";

export const syncController = {
  pull: asyncHandler(async (req: Request, res: Response) => {
    const result = await syncService.pull(req.query as unknown as PullQuery);
    res.json({ success: true, ...result });
  }),

  push: asyncHandler(async (req: Request<unknown, unknown, PushBody>, res: Response) => {
    const result = await syncService.push(req.body);
    res.json({ success: true, ...result });
  }),

  history: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.query.schoolId as string;
    const history = await syncService.history(schoolId);
    res.json({ success: true, data: history });
  }),
};
