"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFinancialAidQuerySchema = exports.createFinancialAidSchema = void 0;
const zod_1 = require("zod");
exports.createFinancialAidSchema = zod_1.z
    .object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["SCHOLARSHIP", "DISCOUNT"]),
    label: zod_1.z.string().min(2, "Libellé requis"),
    percentage: zod_1.z.number().min(0).max(100).optional(),
    fixedAmount: zod_1.z.number().positive().optional(),
})
    .refine((data) => data.percentage !== undefined || data.fixedAmount !== undefined, {
    message: "Indiquez un pourcentage ou un montant fixe",
    path: ["percentage"],
});
exports.listFinancialAidQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=financialAid.validation.js.map