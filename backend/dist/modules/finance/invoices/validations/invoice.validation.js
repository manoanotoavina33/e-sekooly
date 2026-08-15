"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInvoicesQuerySchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid(),
    feeCategoryId: zod_1.z.string().uuid(),
    schoolYearId: zod_1.z.string().uuid().optional(),
    amount: zod_1.z.number().positive("Le montant doit être positif"),
    dueDate: zod_1.z.coerce.date().optional(),
});
exports.listInvoicesQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).optional(),
});
//# sourceMappingURL=invoice.validation.js.map