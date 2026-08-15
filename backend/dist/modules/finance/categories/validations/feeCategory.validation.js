"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFeeCategoriesQuerySchema = exports.createFeeCategorySchema = void 0;
const zod_1 = require("zod");
exports.createFeeCategorySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Nom requis"),
    description: zod_1.z.string().optional(),
});
exports.listFeeCategoriesQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
});
//# sourceMappingURL=feeCategory.validation.js.map