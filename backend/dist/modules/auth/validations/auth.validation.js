"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = exports.enable2faSchema = exports.refreshSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Adresse e-mail invalide"),
    password: zod_1.z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    otpCode: zod_1.z.string().length(6, "Le code 2FA doit contenir 6 chiffres").optional(),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10),
});
exports.enable2faSchema = zod_1.z.object({
    otpCode: zod_1.z.string().length(6, "Code à 6 chiffres requis"),
});
exports.registerUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    schoolId: zod_1.z.string().uuid().optional(),
    roles: zod_1.z.array(zod_1.z.enum([
        "SUPER_ADMIN",
        "ADMIN",
        "DIRECTOR",
        "SECRETARY",
        "ACCOUNTANT",
        "TEACHER",
        "SUPERVISOR",
        "PARENT",
        "STUDENT",
    ])).min(1, "Au moins un rôle est requis"),
});
//# sourceMappingURL=auth.validation.js.map