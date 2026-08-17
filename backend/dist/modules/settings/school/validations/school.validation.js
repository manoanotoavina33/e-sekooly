"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertSystemSettingSchema = exports.createSemesterSchema = exports.createSchoolYearSchema = exports.updateSchoolSchema = void 0;
const zod_1 = require("zod");
exports.updateSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    shortName: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal("")),
    website: zod_1.z.string().optional(),
    currency: zod_1.z.string().length(3).optional(),
    timezone: zod_1.z.string().optional(),
    schoolTypes: zod_1.z.array(zod_1.z.enum(["PRIMARY", "COLLEGE", "LYCEE", "UNIVERSITE"])).optional(),
});
exports.createSchoolYearSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    label: zod_1.z.string().min(4, "Libellé requis (ex: 2026-2027)"),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
});
exports.createSemesterSchema = zod_1.z.object({
    schoolYearId: zod_1.z.string().uuid(),
    label: zod_1.z.string().min(1, "Libellé requis"),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
});
exports.upsertSystemSettingSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    key: zod_1.z.string().min(1),
    value: zod_1.z.string(),
});
//# sourceMappingURL=school.validation.js.map