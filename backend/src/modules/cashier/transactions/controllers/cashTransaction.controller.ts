import { Request, Response } from "express";
import { prisma } from "../../../../config/prisma";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { cashTransactionService } from "../services/cashTransaction.service";
import { streamCashReceiptPdf } from "../utils/cashReceiptPdf";
import {
  CreateCashTransactionInput,
  ListCashTransactionsQuery,
  ReceiptFormatQuery,
  ValidateCashTransactionInput,
} from "../validations/cashTransaction.validation";

export const cashTransactionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const transactions = await cashTransactionService.list(req.query as unknown as ListCashTransactionsQuery);
    res.json({ success: true, data: transactions });
  }),

  record: asyncHandler(async (req: Request<unknown, unknown, CreateCashTransactionInput>, res: Response) => {
    const transaction = await cashTransactionService.record(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: transaction });
  }),

  validate: asyncHandler(async (req: Request<{ id: string }, unknown, ValidateCashTransactionInput>, res: Response) => {
    const transaction = await cashTransactionService.validate(req.params.id, req.body.status, req.auth!.userId);
    res.json({ success: true, data: transaction });
  }),

  receiptPdf: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const query = req.query as unknown as ReceiptFormatQuery;
    const transaction = await cashTransactionService.getById(req.params.id);

    const school = await prisma.school.findUnique({
      where: { id: transaction.cashSession.cashRegister.schoolId },
      select: { name: true },
    });

    streamCashReceiptPdf(res, query.format, {
      receiptNo: transaction.receiptNo,
      type: transaction.type as "IN" | "OUT",
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      createdAt: transaction.createdAt,
      cashRegisterName: transaction.cashSession.cashRegister.name,
      schoolName: school?.name,
    });
  }),
};
