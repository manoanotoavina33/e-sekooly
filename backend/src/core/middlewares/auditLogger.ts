// src/core/middlewares/auditLogger.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";

/**
 * Middleware that logs every POST/PUT/PATCH/DELETE request into the `AuditLog` table.
 * It skips health‑check routes and GET requests (non‑mutating).
 */
export async function auditLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const method = req.method.toUpperCase();
  const path = req.path;

  const shouldLog = ["POST", "PUT", "PATCH", "DELETE"].includes(method) && !path.startsWith("/api/health");

  // Capture the original send to run after logging
  const originalSend = res.send.bind(res);
  // @ts-ignore – we replace send dynamically
  res.send = (body?: any) => {
    if (shouldLog) {
      void prisma.auditLog.create({
        data: {
          userId: (req as any).auth?.userId,
          action: `${method} ${path}`,
          entityId: (req.params && (req.params as any).id) || undefined,
          metadata: req.body ? req.body : undefined,
        },
      });
    }
    // preserve original behaviour
    return originalSend(body);
  };

  // Continue to next middleware / route handler
  next();
}
