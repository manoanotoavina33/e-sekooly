"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDisciplineQuerySchema = exports.createDisciplineRecordSchema = void 0;
const zod_1 = require("zod");
exports.createDisciplineRecordSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(["SANCTION", "REWARD", "LATENESS", "OBSERVATION"]),
    severity: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
    title: zod_1.z.string().min(2, "Titre requis"),
    description: zod_1.z.string().optional(),
    date: zod_1.z.coerce.date().optional(),
});
exports.listDisciplineQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    studentId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(["SANCTION", "REWARD", "LATENESS", "OBSERVATION"]).optional(),
});
//# sourceMappingURL=discipline.validation.js.map