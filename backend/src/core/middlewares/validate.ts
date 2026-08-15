import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Valide req.body contre un schéma Zod. En cas d'échec, l'erreur ZodError
 * est transmise au errorHandler global qui la formate proprement.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

/**
 * Valide req.query contre un schéma Zod (utilisé pour la pagination,
 * les filtres de recherche, etc.).
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query) as never;
    next();
  };
}
