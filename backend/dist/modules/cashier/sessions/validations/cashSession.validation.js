"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCashSessionsQuerySchema = exports.closeCashSessionSchema = exports.openCashSessionSchema = void 0;
const zod_1 = require("zod");
exports.openCashSessionSchema = zod_1.z.object({
    cashRegisterId: zod_1.z.string().uuid(),
    openingBalance: zod_1.z.number().nonnegative(),
});
exports.closeCashSessionSchema = zod_1.z.object({
    declaredClosingBalance: zod_1.z.number().nonnegative(),
});
exports.listCashSessionsQuerySchema = zod_1.z.object({
    cashRegisterId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["OPEN", "CLOSED"]).optional(),
});
//# sourceMappingURL=cashSession.validation.js.map