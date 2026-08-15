import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { reportCardService } from "../services/reportcard.service";
import { streamReportCardPdf } from "../utils/reportcardPdf";

export const reportCardController = {
  get: asyncHandler(async (req: Request<{ examSessionId: string; studentId: string }>, res: Response) => {
    const report = await reportCardService.generate(req.params.examSessionId, req.params.studentId);
    res.json({ success: true, data: report });
  }),

  getPdf: asyncHandler(async (req: Request<{ examSessionId: string; studentId: string }>, res: Response) => {
    const report = await reportCardService.generate(req.params.examSessionId, req.params.studentId);
    await streamReportCardPdf(res, report);
  }),
};
