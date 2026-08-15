"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = auditLogger;
const prisma_1 = require("../../config/prisma");
/**
 * Middleware that logs every POST/PUT/PATCH/DELETE request into the `AuditLog` table.
 * It skips health‑check routes and GET requests (non‑mutating).
 */
async function auditLogger(req, res, next) {
    const start = Date.now();
    const method = req.method.toUpperCase();
    const path = req.path;
    const shouldLog = ["POST", "PUT", "PATCH", "DELETE"].includes(method) && !path.startsWith("/api/health");
    // Capture the original send to run after logging
    const originalSend = res.send.bind(res);
    // @ts-ignore – we replace send dynamically
    res.send = (body) => {
        if (shouldLog) {
            void prisma_1.prisma.auditLog.create({
                data: {
                    userId: req.auth?.userId,
                    action: `${method} ${path}`,
                    entityId: (req.params && req.params.id) || undefined,
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
//# sourceMappingURL=auditLogger.js.map