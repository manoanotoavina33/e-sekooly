/**
 * Erreur applicative de base. Toutes les erreurs métier (auth, validation,
 * conflit, etc.) doivent hériter de cette classe pour être interceptées
 * proprement par le middleware d'erreurs global.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Non authentifié") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé : permissions insuffisantes") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Ressource") {
    super(`${resource} introuvable`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit sur la ressource") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown, message = "Données invalides") {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}
