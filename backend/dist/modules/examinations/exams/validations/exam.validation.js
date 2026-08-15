"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeliberationSchema = exports.listExamsQuerySchema = exports.createExamSchema = exports.listExamSessionsQuerySchema = exports.createExamSessionSchema = void 0;
const zod_1 = require("zod");
exports.createExamSessionSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    semesterId: zod_1.z.string().uuid().optional(),
    label: zod_1.z.string().min(2, "Libellé requis"),
    type: zod_1.z.enum(["DEVOIR", "COMPOSITION", "EXAM_BLANC", "EXAM_OFFICIEL"]).default("DEVOIR"),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
});
exports.listExamSessionsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
});
exports.createExamSchema = zod_1.z.object({
    examSessionId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid(),
    date: zod_1.z.coerce.date(),
    room: zod_1.z.string().optional(),
    maxScore: zod_1.z.number().positive().default(20),
    supervisorIds: zod_1.z.array(zod_1.z.string().uuid()).optional().default([]),
});
exports.listExamsQuerySchema = zod_1.z.object({
    examSessionId: zod_1.z.string().uuid().optional(),
    classRoomId: zod_1.z.string().uuid().optional(),
});
exports.validateDeliberationSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "VALIDATED"]),
});
//# sourceMappingURL=exam.validation.js.map