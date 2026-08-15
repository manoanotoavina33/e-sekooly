"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.listUsersQuerySchema = void 0;
const zod_1 = require("zod");
exports.listUsersQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid().optional(),
    role: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
exports.createUserSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(1, "Prénom requis"),
    lastName: zod_1.z.string().min(1, "Nom requis"),
    email: zod_1.z.string().email("E-mail invalide"),
    password: zod_1.z.string().min(6, "Mot de passe minimum 6 caractères"),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "Au moins un rôle requis"),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "Prénom requis").optional(),
    lastName: zod_1.z.string().min(1, "Nom requis").optional(),
    email: zod_1.z.string().email("E-mail invalide").optional(),
    password: zod_1.z.string().min(6, "Mot de passe minimum 6 caractères").optional().or(zod_1.z.literal("")),
    roleIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "Au moins un rôle requis").optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=user.validation.js.map