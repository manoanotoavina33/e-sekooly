"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const prisma_1 = require("../../../../config/prisma");
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const payment_service_1 = require("../services/payment.service");
const receiptPdf_1 = require("../utils/receiptPdf");
exports.paymentController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const payments = await payment_service_1.paymentService.list({
            invoiceId: query.invoiceId,
            schoolId: query.schoolId,
            month: query.month ? Number(query.month) : undefined,
            year: query.year ? Number(query.year) : undefined,
        });
        res.json({ success: true, data: payments });
    }),
    studentStatus: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { schoolId, month, year } = req.query;
        if (!schoolId || !month || !year) {
            res.status(400).json({ success: false, message: "schoolId, month et year sont requis" });
            return;
        }
        const result = await payment_service_1.paymentService.studentPaymentStatus(schoolId, Number(month), Number(year));
        res.json({ success: true, data: result });
    }),
    record: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const payment = await payment_service_1.paymentService.record(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: payment });
    }),
    quickRecord: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const payment = await payment_service_1.paymentService.recordQuickPayment(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: payment });
    }),
    receiptPdf: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const payment = await payment_service_1.paymentService.getById(req.params.id);
        // Résolution du nom de l'école et du caissier pour le reçu
        const school = await prisma_1.prisma.school.findUnique({
            where: { id: payment.invoice.schoolId },
            select: { name: true },
        });
        let cashierName;
        if (payment.recordedBy) {
            const cashier = await prisma_1.prisma.user.findUnique({
                where: { id: payment.recordedBy },
                select: { firstName: true, lastName: true },
            });
            if (cashier)
                cashierName = `${cashier.firstName} ${cashier.lastName}`;
        }
        (0, receiptPdf_1.streamReceiptPdf)(res, {
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
//# sourceMappingURL=payment.controller.js.map