import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { cashRegisterService } from "../services/cashRegister.service";
import { CreateCashRegisterInput, ListCashRegistersQuery } from "../validations/cashRegister.validation";

export const cashRegisterController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const registers = await cashRegisterService.list(req.query as unknown as ListCashRegistersQuery);
    res.json({ success: true, data: registers });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateCashRegisterInput>, res: Response) => {
    const register = await cashRegisterService.create(req.body);
    res.status(201).json({ success: true, data: register });
  }),
};
