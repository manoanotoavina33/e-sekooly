"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStaffAttendanceQuerySchema = exports.staffBulkAttendanceSchema = exports.staffBulkEntrySchema = exports.staffCheckoutSchema = exports.staffCheckinSchema = void 0;
const zod_1 = require("zod");
exports.staffCheckinSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
});
exports.staffCheckoutSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
});
exports.staffBulkEntrySchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    note: zod_1.z.string().optional(),
});
exports.staffBulkAttendanceSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    date: zod_1.z.coerce.date(),
    entries: zod_1.z.array(exports.staffBulkEntrySchema).min(1, "Au moins une entrée requise"),
});
exports.listStaffAttendanceQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    employeeId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
//# sourceMappingURL=staffAttendance.validation.js.map