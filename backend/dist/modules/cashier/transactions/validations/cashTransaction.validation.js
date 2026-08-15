"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptFormatQuerySchema = exports.listCashTransactionsQuerySchema = exports.validateCashTransactionSchema = exports.createCashTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createCashTransactionSchema = zod_1.z.object({
    cashSessionId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["IN", "OUT"]),
    amount: zod_1.z.number().positive("Le montant doit être positif"),
    category: zod_1.z.string().min(1, "Catégorie requise"),
    description: zod_1.z.string().optional(),
});
exports.validateCashTransactionSchema = zod_1.z.object({
    status: zod_1.z.enum(["VALIDATED", "REJECTED"]),
});
exports.listCashTransactionsQuerySchema = zod_1.z.object({
    cashSessionId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["PENDING", "VALIDATED", "REJECTED"]).optional(),
});
exports.receiptFormatQuerySchema = zod_1.z.object({
    format: zod_1.z.enum(["58mm", "80mm", "A4"]).default("A4"),
});
//# sourceMappingURL=cashTransaction.validation.js.map