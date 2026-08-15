import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError";

/**
 * Autorise l'accès uniquement si l'utilisateur authentifié possède AU MOINS
 * une des permissions fournies. Ex: authorize("students.create")
 *
 * Le rôle SUPER_ADMIN passe toujours (bypass total), conformément à
 * l'exigence "chaque rôle possède uniquement ses permissions" tout en
 * gardant un rôle racine capable de tout administrer.
 */
export function authorize(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw new UnauthorizedError();
    }

    if (req.auth.roles.includes("SUPER_ADMIN")) {
      return next();
    }

    const hasPermission = requiredPermissions.some((perm) => req.auth!.permissions.includes(perm));

    if (!hasPermission) {
      throw new ForbiddenError();
    }

    next();
  };
}
