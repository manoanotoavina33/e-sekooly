"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashTransactionController = void 0;
const prisma_1 = require("../../../../config/prisma");
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const cashTransaction_service_1 = require("../services/cashTransaction.service");
const cashReceiptPdf_1 = require("../utils/cashReceiptPdf");
exports.cashTransactionController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const transactions = await cashTransaction_service_1.cashTransactionService.list(req.query);
        res.json({ success: true, data: transactions });
    }),
    record: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const transaction = await cashTransaction_service_1.cashTransactionService.record(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: transaction });
    }),
    validate: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const transaction = await cashTransaction_service_1.cashTransactionService.validate(req.params.id, req.body.status, req.auth.userId);
        res.json({ success: true, data: transaction });
    }),
    receiptPdf: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const transaction = await cashTransaction_service_1.cashTransactionService.getById(req.params.id);
        const school = await prisma_1.prisma.school.findUnique({
            where: { id: transaction.cashSession.cashRegister.schoolId },
            select: { name: true },
        });
        (0, cashReceiptPdf_1.streamCashReceiptPdf)(res, query.format, {
            receiptNo: transaction.receiptNo,
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            createdAt: transaction.createdAt,
            cashRegisterName: transaction.cashSession.cashRegister.name,
            schoolName: school?.name,
        });
    }),
};
//# sourceMappingURL=cashTransaction.controller.js.map