import crypto from "crypto";
import { prisma } from "../../../config/prisma";

/**
 * Couche d'accès aux données pour l'authentification.
 * Aucune logique métier ici : uniquement des requêtes Prisma.
 */
export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });
  },

  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    schoolId?: string;
    roleNames: string[];
  }) {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash: data.passwordHash,
        schoolId: data.schoolId,
        roles: {
          create: data.roleNames.map((roleName) => ({
            role: { connect: { name: roleName as never } },
          })),
        },
      },
    });
  },

  updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  setTwoFactorSecret(userId: string, secret: string | null, enabled: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: enabled },
    });
  },

  hashToken(rawToken: string) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  },

  storeRefreshToken(params: {
    userId: string;
    rawToken: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: authRepository.hashToken(params.rawToken),
        expiresAt: params.expiresAt,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
      },
    });
  },

  findValidRefreshToken(rawToken: string) {
    const tokenHash = authRepository.hashToken(rawToken);
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  revokeRefreshToken(rawToken: string) {
    const tokenHash = authRepository.hashToken(rawToken);
    return prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllRefreshTokensForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  writeAuditLog(params: {
    schoolId?: string | null;
    userId?: string | null;
    action: string;
    ipAddress?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.auditLog.create({
      data: {
        schoolId: params.schoolId ?? undefined,
        userId: params.userId ?? undefined,
        action: params.action,
        ipAddress: params.ipAddress,
        metadata: params.metadata as never,
      },
    });
  },
};
