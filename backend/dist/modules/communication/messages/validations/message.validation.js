"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
exports.sendMessageSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    subject: zod_1.z.string().min(1, "Objet requis"),
    body: zod_1.z.string().min(1, "Le message ne peut être vide"),
    recipientIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "Au moins un destinataire requis"),
});
//# sourceMappingURL=message.validation.js.map