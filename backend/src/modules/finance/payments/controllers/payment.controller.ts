import { Request, Response } from "express";
import { prisma } from "../../../../config/prisma";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { paymentService } from "../services/payment.service";
import { streamReceiptPdf } from "../utils/receiptPdf";
import { CreatePaymentInput, ListPaymentsQuery } from "../validations/payment.validation";

export const paymentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListPaymentsQuery;
    const payments = await paymentService.list({
      invoiceId: query.invoiceId,
      schoolId: query.schoolId,
      month: query.month ? Number(query.month) : undefined,
      year: query.year ? Number(query.year) : undefined,
    });
    res.json({ success: true, data: payments });
  }),

  studentStatus: asyncHandler(async (req: Request, res: Response) => {
    const { schoolId, month, year } = req.query as Record<string, string>;
    if (!schoolId || !month || !year) {
      res.status(400).json({ success: false, message: "schoolId, month et year sont requis" });
      return;
    }
    const result = await paymentService.studentPaymentStatus(schoolId, Number(month), Number(year));
    res.json({ success: true, data: result });
  }),

  record: asyncHandler(async (req: Request<unknown, unknown, CreatePaymentInput>, res: Response) => {
    const payment = await paymentService.record(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: payment });
  }),

  quickRecord: asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.recordQuickPayment(req.body, req.auth?.userId);
    res.status(201).json({ success: true, data: payment });
  }),

  receiptPdf: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const payment = await paymentService.getById(req.params.id);

    // Résolution du nom de l'école et du caissier pour le reçu
    const school = await prisma.school.findUnique({
      where: { id: payment.invoice.schoolId },
      select: { name: true },
    });
    let cashierName: string | undefined;
    if (payment.recordedBy) {
      const cashier = await prisma.user.findUnique({
        where: { id: payment.recordedBy },
        select: { firstName: true, lastName: true },
      });
      if (cashier) cashierName = `${cashier.firstName} ${cashier.lastName}`;
    }

    streamReceiptPdf(res, {
      receiptNo: payment.receiptNo,
      amount: payment.amount,
      method: payment.method,
      paidAt: payment.paidAt,
      invoiceNo: payment.invoice.invoiceNo,
      studentName: `${payment.invoice.student.firstName} ${payment.invoice.student.lastName}`,
      studentRegistrationNo: payment.invoice.student.registrationNo,
      studentClassName: payment.invoice.student.classRoom?.name,
      feeCategoryName: payment.invoice.feeCategory.name,
      schoolName: school?.name,
      cashierName,
    });
  }),
};
