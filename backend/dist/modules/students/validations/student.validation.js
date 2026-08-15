"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudentsQuerySchema = exports.suspendStudentSchema = exports.changeClassSchema = exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid().optional(),
    firstName: zod_1.z.string().min(2, "Prénom requis"),
    lastName: zod_1.z.string().min(2, "Nom requis"),
    gender: zod_1.z.enum(["MALE", "FEMALE"]),
    dateOfBirth: zod_1.z.coerce.date(),
    placeOfBirth: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
});
exports.updateStudentSchema = exports.createStudentSchema.partial().extend({
    status: zod_1.z.enum(["ACTIVE", "SUSPENDED", "EXCLUDED", "GRADUATED", "TRANSFERRED", "ARCHIVED"]).optional(),
});
exports.changeClassSchema = zod_1.z.object({
    classRoomId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().optional(),
});
exports.suspendStudentSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, "Motif requis"),
    type: zod_1.z.enum(["SUSPENSION", "EXCLUSION"]),
});
exports.listStudentsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["ACTIVE", "SUSPENDED", "EXCLUDED", "GRADUATED", "TRANSFERRED", "ARCHIVED"]).optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=student.validation.js.map