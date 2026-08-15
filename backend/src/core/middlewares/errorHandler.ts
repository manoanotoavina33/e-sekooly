import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

/**
 * Middleware global de gestion des erreurs. Doit être enregistré en dernier
 * dans la chaîne Express (après toutes les routes).
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Données invalides",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
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

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} introuvable`,
  });
}
