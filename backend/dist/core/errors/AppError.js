"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.AppError = void 0;
/**
 * Erreur applicative de base. Toutes les erreurs métier (auth, validation,
 * conflit, etc.) doivent hériter de cette classe pour être interceptées
 * proprement par le middleware d'erreurs global.
 */
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = "Non authentifié") {
        super(message, 401, "UNAUTHORIZED");
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = "Accès refusé : permissions insuffisantes") {
        super(message, 403, "FORBIDDEN");
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource = "Ressource") {
        super(`${resource} introuvable`, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Conflit sur la ressource") {
        super(message, 409, "CONFLICT");
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(details, message = "Données invalides") {
        super(message, 422, "VALIDATION_ERROR", details);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=AppError.js.map