"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGradesQuerySchema = exports.bulkGradesSchema = exports.gradeEntrySchema = void 0;
const zod_1 = require("zod");
exports.gradeEntrySchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid(),
    score: zod_1.z.number().min(0, "La note ne peut être négative"),
    comment: zod_1.z.string().optional(),
});
exports.bulkGradesSchema = zod_1.z.object({
    examId: zod_1.z.string().uuid(),
    entries: zod_1.z.array(exports.gradeEntrySchema).min(1, "Au moins une note requise"),
});
exports.listGradesQuerySchema = zod_1.z.object({
    examId: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=grade.validation.js.map