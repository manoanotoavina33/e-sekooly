"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClassRoomsQuerySchema = exports.updateClassRoomSchema = exports.createClassRoomSchema = void 0;
const zod_1 = require("zod");
exports.createClassRoomSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, "Nom de classe requis"),
    level: zod_1.z.string().min(1, "Niveau requis"),
    track: zod_1.z.string().optional(),
    section: zod_1.z.string().optional(),
    room: zod_1.z.string().optional(),
    capacity: zod_1.z.number().int().positive().default(40),
    homeroomTeacherId: zod_1.z.string().uuid().optional(),
});
exports.updateClassRoomSchema = exports.createClassRoomSchema.partial().omit({ schoolId: true });
exports.listClassRoomsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=classroom.validation.js.map