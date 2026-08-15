import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { invoiceService } from "../services/invoice.service";
import { CreateInvoiceInput, ListInvoicesQuery } from "../validations/invoice.validation";

export const invoiceController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const invoices = await invoiceService.list(req.query as unknown as ListInvoicesQuery);
    res.json({ success: true, data: invoices });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const invoice = await invoiceService.getById(req.params.id);
    res.json({ success: true, data: invoice });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateInvoiceInput>, res: Response) => {
    const invoice = await invoiceService.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  }),

  summary: asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.query.schoolId as string;
    const summary = await invoiceService.financeSummary(schoolId);
    res.json({ success: true, data: summary });
  }),
};
