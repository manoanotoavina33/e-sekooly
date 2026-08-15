"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSubjectsQuerySchema = exports.updateSubjectSchema = exports.createSubjectSchema = void 0;
const zod_1 = require("zod");
exports.createSubjectSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Nom de matière requis"),
    coefficient: zod_1.z.number().positive().default(1),
    hoursPerWeek: zod_1.z.number().int().positive().default(1),
    program: zod_1.z.string().optional(),
});
exports.updateSubjectSchema = exports.createSubjectSchema.partial().omit({ schoolId: true });
exports.listSubjectsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=subject.validation.js.map