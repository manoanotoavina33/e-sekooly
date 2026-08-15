import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { env } from "../../../config/env";
import { ConflictError, UnauthorizedError } from "../../../core/errors/AppError";
import { authRepository } from "../repositories/auth.repository";
import { LoginInput, RegisterUserInput } from "../validations/auth.validation";

type UserWithRoles = Awaited<ReturnType<typeof authRepository.findUserByEmail>>;

function extractRolesAndPermissions(user: NonNullable<UserWithRoles>) {
  const roles = user.roles.map((ur: { role: { name: string } }) => ur.role.name);
  const permissions = Array.from(
    new Set(
      user.roles.flatMap((ur: { role: { permissions: { permission: { code: string } }[] } }) =>
        ur.role.permissions.map((rp) => rp.permission.code)
      )
    )
  );
  return { roles, permissions };
}

function signAccessToken(user: NonNullable<UserWithRoles>) {
  const { roles, permissions } = extractRolesAndPermissions(user);
  const payload = { sub: user.id, schoolId: user.schoolId, roles, permissions };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export const authService = {
  async register(input: RegisterUserInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("Un utilisateur avec cet e-mail existe déjà");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      schoolId: input.schoolId,
      roleNames: input.roles,
    });
  },

  /**
   * Authentifie un utilisateur. Si la 2FA est activée et qu'aucun code (ou un
   * code invalide) n'est fourni, renvoie `requiresTwoFactor: true` sans
   * délivrer de tokens.
   */
  async login(input: LoginInput, context: { ipAddress?: string; userAgent?: string }) {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Identifiants incorrects");
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Identifiants incorrects");
    }

    if (user.twoFactorEnabled) {
      if (!input.otpCode) {
        return { requiresTwoFactor: true as const };
      }
      const valid = authenticator.check(input.otpCode, user.twoFactorSecret ?? "");
      if (!valid) {
        throw new UnauthorizedError("Code d'authentification à deux facteurs invalide");
      }
    }

    const accessToken = signAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);

    await authRepository.storeRefreshToken({
      userId: user.id,
      rawToken: refreshToken,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });
    await authRepository.updateLastLogin(user.id);
    await authRepository.writeAuditLog({
      schoolId: user.schoolId,
      userId: user.id,
      action: "AUTH_LOGIN",
      ipAddress: context.ipAddress,
    });

    const { roles, permissions } = extractRolesAndPermissions(user);

    return {
      requiresTwoFactor: false as const,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        schoolId: user.schoolId,
        roles,
        permissions,
      },
    };
  },

  async refresh(rawRefreshToken: string) {
    const stored = await authRepository.findValidRefreshToken(rawRefreshToken);
    if (!stored) {
      throw new UnauthorizedError("Refresh token invalide ou expiré");
    }

    const user = await authRepository.findUserById(stored.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Utilisateur introuvable ou désactivé");
    }

    // Rotation du refresh token : on révoque l'ancien et on en émet un nouveau.
    await authRepository.revokeRefreshToken(rawRefreshToken);
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);
    await authRepository.storeRefreshToken({ userId: user.id, rawToken: newRefreshToken, expiresAt });

    return {
      accessToken: signAccessToken(user),
      refreshToken: newRefreshToken,
    };
  },

  async logout(rawRefreshToken: string) {
    await authRepository.revokeRefreshToken(rawRefreshToken);
  },

  /** Étape 1 de l'activation 2FA : génère un secret + QR code à scanner. */
  async generateTwoFactorSetup(userId: string, userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(userEmail, "e-sekooly", secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Secret stocké mais 2FA pas encore activée tant que l'utilisateur n'a
    // pas confirmé avec un code valide (voir confirmTwoFactor).
    await authRepository.setTwoFactorSecret(userId, secret, false);

    return { secret, qrCodeDataUrl };
  },

  async confirmTwoFactor(userId: string, secret: string, otpCode: string) {
    const valid = authenticator.check(otpCode, secret);
    if (!valid) {
      throw new UnauthorizedError("Code invalide, activation 2FA annulée");
    }
    await authRepository.setTwoFactorSecret(userId, secret, true);
  },

  async disableTwoFactor(userId: string) {
    await authRepository.setTwoFactorSecret(userId, null, false);
  },
};
