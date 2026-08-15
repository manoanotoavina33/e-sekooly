import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { feeCategoryService } from "../services/feeCategory.service";
import { CreateFeeCategoryInput, ListFeeCategoriesQuery } from "../validations/feeCategory.validation";

export const feeCategoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const categories = await feeCategoryService.list(req.query as unknown as ListFeeCategoriesQuery);
    res.json({ success: true, data: categories });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateFeeCategoryInput>, res: Response) => {
    const category = await feeCategoryService.create(req.body);
    res.status(201).json({ success: true, data: category });
  }),
};
