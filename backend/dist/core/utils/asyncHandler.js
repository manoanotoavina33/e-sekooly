"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
/**
 * Enveloppe un contrôleur async pour transmettre automatiquement toute
 * exception au middleware d'erreurs global (errorHandler.ts).
 * Générique sur le type de Request pour accepter les contrôleurs qui typent
 * précisément req.params / req.query / req.body (ex: Request<{ id: string }>).
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=asyncHandler.js.map