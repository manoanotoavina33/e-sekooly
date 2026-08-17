"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAnnouncementsQuerySchema = exports.updateAnnouncementSchema = exports.createAnnouncementSchema = void 0;
const zod_1 = require("zod");
exports.createAnnouncementSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(2, "Titre requis"),
    body: zod_1.z.string().min(1, "Contenu requis"),
    audience: zod_1.z.enum(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "STAFF"]).default("ALL"),
});
exports.updateAnnouncementSchema = exports.createAnnouncementSchema.partial();
exports.listAnnouncementsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    audience: zod_1.z.enum(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "STAFF"]).optional(),
});
//# sourceMappingURL=announcement.validation.js.map