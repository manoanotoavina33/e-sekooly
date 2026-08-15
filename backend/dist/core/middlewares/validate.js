"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
/**
 * Valide req.body contre un schéma Zod. En cas d'échec, l'erreur ZodError
 * est transmise au errorHandler global qui la formate proprement.
 */
function validateBody(schema) {
    return (req, _res, next) => {
        req.body = schema.parse(req.body);
        next();
    };
}
/**
 * Valide req.query contre un schéma Zod (utilisé pour la pagination,
 * les filtres de recherche, etc.).
 */
function validateQuery(schema) {
    return (req, _res, next) => {
        req.query = schema.parse(req.query);
        next();
    };
}
//# sourceMappingURL=validate.js.map