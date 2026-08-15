import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { UnauthorizedError } from "../errors/AppError";

export interface AuthContext {
  userId: string;
  schoolId: string | null;
  roles: string[];
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Vérifie le JWT d'accès (header Authorization: Bearer <token>) et attache
 * le contexte utilisateur (id, école, rôles, permissions) à req.auth.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token d'accès manquant");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as AuthContext & {
      sub: string;
    };
    req.auth = {
      userId: payload.sub,
      schoolId: payload.schoolId ?? null,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
    next();
  } catch {
    throw new UnauthorizedError("Token d'accès invalide ou expiré");
  }
}
