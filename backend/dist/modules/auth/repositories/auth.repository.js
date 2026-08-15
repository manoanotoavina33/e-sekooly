"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../config/prisma");
/**
 * Couche d'accès aux données pour l'authentification.
 * Aucune logique métier ici : uniquement des requêtes Prisma.
 */
exports.authRepository = {
    findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
            },
        });
    },
    findUserById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
            },
        });
    },
    createUser(data) {
        return prisma_1.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                passwordHash: data.passwordHash,
                schoolId: data.schoolId,
                roles: {
                    create: data.roleNames.map((roleName) => ({
                        role: { connect: { name: roleName } },
                    })),
                },
            },
        });
    },
    updateLastLogin(userId) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    },
    setTwoFactorSecret(userId, secret, enabled) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret, twoFactorEnabled: enabled },
        });
    },
    hashToken(rawToken) {
        return crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    },
    storeRefreshToken(params) {
        return prisma_1.prisma.refreshToken.create({
            data: {
                userId: params.userId,
                tokenHash: exports.authRepository.hashToken(params.rawToken),
                expiresAt: params.expiresAt,
                userAgent: params.userAgent,
                ipAddress: params.ipAddress,
            },
        });
    },
    findValidRefreshToken(rawToken) {
        const tokenHash = exports.authRepository.hashToken(rawToken);
        return prisma_1.prisma.refreshToken.findFirst({
            where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
        });
    },
    revokeRefreshToken(rawToken) {
        const tokenHash = exports.authRepository.hashToken(rawToken);
        return prisma_1.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revokedAt: new Date() },
        });
    },
    revokeAllRefreshTokensForUser(userId) {
        return prisma_1.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    },
    writeAuditLog(params) {
        return prisma_1.prisma.auditLog.create({
            data: {
                schoolId: params.schoolId ?? undefined,
                userId: params.userId ?? undefined,
                action: params.action,
                ipAddress: params.ipAddress,
                metadata: params.metadata,
            },
        });
    },
};
//# sourceMappingURL=auth.repository.js.map