import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { gradeService } from "../services/grade.service";
import { BulkGradesInput, ListGradesQuery } from "../validations/grade.validation";

export const gradeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const grades = await gradeService.list(req.query as unknown as ListGradesQuery);
    res.json({ success: true, data: grades });
  }),

  bulkSave: asyncHandler(async (req: Request<unknown, unknown, BulkGradesInput>, res: Response) => {
    const grades = await gradeService.bulkSave(req.body);
    res.status(201).json({ success: true, data: grades });
  }),
};
