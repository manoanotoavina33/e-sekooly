"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushBodySchema = exports.pullQuerySchema = void 0;
const zod_1 = require("zod");
exports.pullQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().min(1),
    since: zod_1.z.coerce.date().optional(),
});
exports.pushBodySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    deviceId: zod_1.z.string().min(1),
    changes: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()))),
});
//# sourceMappingURL=sync.validation.js.map