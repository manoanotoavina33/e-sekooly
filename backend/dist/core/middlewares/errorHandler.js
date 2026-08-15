"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
/**
 * Middleware global de gestion des erreurs. Doit être enregistré en dernier
 * dans la chaîne Express (après toutes les routes).
 */
function errorHandler(err, req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(422).json({
            success: false,
            code: "VALIDATION_ERROR",
            message: "Données invalides",
            details: err.flatten(),
        });
    }
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            details: err.details,
        });
    }
    // eslint-disable-next-line no-console
    console.error("[UNHANDLED ERROR]", err);
    return res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Une erreur interne est survenue",
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        code: "ROUTE_NOT_FOUND",
        message: `Route ${req.method} ${req.originalUrl} introuvable`,
    });
}
//# sourceMappingURL=errorHandler.js.map