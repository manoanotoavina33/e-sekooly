"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCashRegistersQuerySchema = exports.createCashRegisterSchema = void 0;
const zod_1 = require("zod");
exports.createCashRegisterSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Nom requis"),
    location: zod_1.z.string().optional(),
});
exports.listCashRegistersQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=cashRegister.validation.js.map