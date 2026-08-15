"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const AppError_1 = require("../errors/AppError");
/**
 * Autorise l'accès uniquement si l'utilisateur authentifié possède AU MOINS
 * une des permissions fournies. Ex: authorize("students.create")
 *
 * Le rôle SUPER_ADMIN passe toujours (bypass total), conformément à
 * l'exigence "chaque rôle possède uniquement ses permissions" tout en
 * gardant un rôle racine capable de tout administrer.
 */
function authorize(...requiredPermissions) {
    return (req, _res, next) => {
        if (!req.auth) {
            throw new AppError_1.UnauthorizedError();
        }
        if (req.auth.roles.includes("SUPER_ADMIN")) {
            return next();
        }
        const hasPermission = requiredPermissions.some((perm) => req.auth.permissions.includes(perm));
        if (!hasPermission) {
            throw new AppError_1.ForbiddenError();
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map