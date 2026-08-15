import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { financialAidService } from "../services/financialAid.service";
import { CreateFinancialAidInput, ListFinancialAidQuery } from "../validations/financialAid.validation";

export const financialAidController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const aids = await financialAidService.list(req.query as unknown as ListFinancialAidQuery);
    res.json({ success: true, data: aids });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateFinancialAidInput>, res: Response) => {
    const aid = await financialAidService.create(req.body);
    res.status(201).json({ success: true, data: aid });
  }),
};
