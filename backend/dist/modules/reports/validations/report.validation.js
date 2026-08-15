"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReportQuerySchema = void 0;
const zod_1 = require("zod");
exports.exportReportQuerySchema = zod_1.z.object({
    format: zod_1.z.enum(["csv", "xlsx", "pdf"]),
    schoolId: zod_1.z.string().uuid().optional(),
    classRoomId: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.string().optional(),
    examSessionId: zod_1.z.string().uuid().optional(),
    examId: zod_1.z.string().uuid().optional(),
    cashSessionId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=report.validation.js.map