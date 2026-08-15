"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = exports.listNotificationsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listNotificationsQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    unreadOnly: zod_1.z.coerce.boolean().optional(),
});
exports.createNotificationSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1),
    body: zod_1.z.string().min(1),
    channel: zod_1.z.enum(["IN_APP", "EMAIL", "SMS"]).default("IN_APP"),
    link: zod_1.z.string().optional(),
});
//# sourceMappingURL=notification.validation.js.map