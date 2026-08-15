"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTimetableQuerySchema = exports.updateTimetableSlotSchema = exports.createTimetableSlotSchema = void 0;
const zod_1 = require("zod");
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
exports.createTimetableSlotSchema = zod_1.z
    .object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid(),
    subjectId: zod_1.z.string().uuid(),
    teacherId: zod_1.z.string().uuid(),
    dayOfWeek: zod_1.z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    startTime: zod_1.z.string().regex(timeRegex, "Format attendu HH:mm"),
    endTime: zod_1.z.string().regex(timeRegex, "Format attendu HH:mm"),
    room: zod_1.z.string().optional(),
})
    .refine((data) => data.startTime < data.endTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
});
exports.updateTimetableSlotSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]).optional(),
    startTime: zod_1.z.string().regex(timeRegex).optional(),
    endTime: zod_1.z.string().regex(timeRegex).optional(),
    room: zod_1.z.string().optional(),
    teacherId: zod_1.z.string().uuid().optional(),
});
exports.listTimetableQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid().optional(),
    teacherId: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=timetable.validation.js.map