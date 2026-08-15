"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function required(name, fallback) {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Variable d'environnement manquante: ${name}`);
    }
    return value;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: required("DATABASE_URL", "file:./dev.db"),
    jwt: {
        accessSecret: required("JWT_ACCESS_SECRET", "change-me-access-secret"),
        refreshSecret: required("JWT_REFRESH_SECRET", "change-me-refresh-secret"),
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
        refreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 30),
    },
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
//# sourceMappingURL=env.js.map