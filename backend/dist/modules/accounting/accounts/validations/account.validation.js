"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAccountsQuerySchema = exports.createAccountSchema = void 0;
const zod_1 = require("zod");
exports.createAccountSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(1, "Code requis"),
    name: zod_1.z.string().min(1, "Nom requis"),
    type: zod_1.z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
});
exports.listAccountsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]).optional(),
});
//# sourceMappingURL=account.validation.js.map