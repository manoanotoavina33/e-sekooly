"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickPaymentSchema = exports.listPaymentsQuerySchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive("Le montant doit être positif"),
    method: zod_1.z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]).default("CASH"),
    note: zod_1.z.string().optional(),
});
exports.listPaymentsQuerySchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid().optional(),
    schoolId: zod_1.z.string().uuid().optional(),
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
    year: zod_1.z.coerce.number().int().min(2000).optional(),
});
exports.quickPaymentSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive("Le montant doit être positif"),
    method: zod_1.z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]).default("CASH"),
    motif: zod_1.z.string().min(1, "Motif requis"),
    month: zod_1.z.number().int().min(1).max(12).optional(),
    year: zod_1.z.number().int().min(2000).optional(),
    note: zod_1.z.string().optional(),
    invoiceId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=payment.validation.js.map