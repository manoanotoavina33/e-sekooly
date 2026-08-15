"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceReportQuerySchema = exports.listAttendanceQuerySchema = exports.bulkAttendanceSchema = exports.bulkAttendanceEntrySchema = exports.checkinByQrSchema = void 0;
const zod_1 = require("zod");
exports.checkinByQrSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    qrCodeToken: zod_1.z.string().min(4, "Jeton QR invalide"),
});
exports.bulkAttendanceEntrySchema = zod_1.z.object({
    studentId: zod_1.z.string().uuid(),
    status: zod_1.z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    note: zod_1.z.string().optional(),
});
exports.bulkAttendanceSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid(),
    date: zod_1.z.coerce.date(),
    entries: zod_1.z.array(exports.bulkAttendanceEntrySchema).min(1, "Au moins une entrée requise"),
});
exports.listAttendanceQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().uuid().optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
});
exports.attendanceReportQuerySchema = exports.listAttendanceQuerySchema;
//# sourceMappingURL=studentAttendance.validation.js.map