"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const AppError_1 = require("../errors/AppError");
/**
 * Vérifie le JWT d'accès (header Authorization: Bearer <token>) et attache
 * le contexte utilisateur (id, école, rôles, permissions) à req.auth.
 */
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        throw new AppError_1.UnauthorizedError("Token d'accès manquant");
    }
    const token = header.slice("Bearer ".length);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
        req.auth = {
            userId: payload.sub,
            schoolId: payload.schoolId ?? null,
            roles: payload.roles ?? [],
            permissions: payload.permissions ?? [],
        };
        next();
    }
    catch {
        throw new AppError_1.UnauthorizedError("Token d'accès invalide ou expiré");
    }
}
//# sourceMappingURL=authenticate.js.map