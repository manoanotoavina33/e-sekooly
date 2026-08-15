"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const env_1 = require("../../../config/env");
const AppError_1 = require("../../../core/errors/AppError");
const auth_repository_1 = require("../repositories/auth.repository");
function extractRolesAndPermissions(user) {
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = Array.from(new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))));
    return { roles, permissions };
}
function signAccessToken(user) {
    const { roles, permissions } = extractRolesAndPermissions(user);
    const payload = { sub: user.id, schoolId: user.schoolId, roles, permissions };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwt.accessSecret, {
        expiresIn: env_1.env.jwt.accessExpiresIn,
    });
}
function generateRefreshToken() {
    return crypto_1.default.randomBytes(48).toString("hex");
}
exports.authService = {
    async register(input) {
        const existing = await auth_repository_1.authRepository.findUserByEmail(input.email);
        if (existing) {
            throw new AppError_1.ConflictError("Un utilisateur avec cet e-mail existe déjà");
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        return auth_repository_1.authRepository.createUser({
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
    async login(input, context) {
        const user = await auth_repository_1.authRepository.findUserByEmail(input.email);
        if (!user || !user.isActive) {
            throw new AppError_1.UnauthorizedError("Identifiants incorrects");
        }
        const passwordValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!passwordValid) {
            throw new AppError_1.UnauthorizedError("Identifiants incorrects");
        }
        if (user.twoFactorEnabled) {
            if (!input.otpCode) {
                return { requiresTwoFactor: true };
            }
            const valid = otplib_1.authenticator.check(input.otpCode, user.twoFactorSecret ?? "");
            if (!valid) {
                throw new AppError_1.UnauthorizedError("Code d'authentification à deux facteurs invalide");
            }
        }
        const accessToken = signAccessToken(user);
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + env_1.env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);
        await auth_repository_1.authRepository.storeRefreshToken({
            userId: user.id,
            rawToken: refreshToken,
            expiresAt,
            userAgent: context.userAgent,
            ipAddress: context.ipAddress,
        });
        await auth_repository_1.authRepository.updateLastLogin(user.id);
        await auth_repository_1.authRepository.writeAuditLog({
            schoolId: user.schoolId,
            userId: user.id,
            action: "AUTH_LOGIN",
            ipAddress: context.ipAddress,
        });
        const { roles, permissions } = extractRolesAndPermissions(user);
        return {
            requiresTwoFactor: false,
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
    async refresh(rawRefreshToken) {
        const stored = await auth_repository_1.authRepository.findValidRefreshToken(rawRefreshToken);
        if (!stored) {
            throw new AppError_1.UnauthorizedError("Refresh token invalide ou expiré");
        }
        const user = await auth_repository_1.authRepository.findUserById(stored.userId);
        if (!user || !user.isActive) {
            throw new AppError_1.UnauthorizedError("Utilisateur introuvable ou désactivé");
        }
        // Rotation du refresh token : on révoque l'ancien et on en émet un nouveau.
        await auth_repository_1.authRepository.revokeRefreshToken(rawRefreshToken);
        const newRefreshToken = generateRefreshToken();
        const expiresAt = new Date(Date.now() + env_1.env.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000);
        await auth_repository_1.authRepository.storeRefreshToken({ userId: user.id, rawToken: newRefreshToken, expiresAt });
        return {
            accessToken: signAccessToken(user),
            refreshToken: newRefreshToken,
        };
    },
    async logout(rawRefreshToken) {
        await auth_repository_1.authRepository.revokeRefreshToken(rawRefreshToken);
    },
    /** Étape 1 de l'activation 2FA : génère un secret + QR code à scanner. */
    async generateTwoFactorSetup(userId, userEmail) {
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(userEmail, "e-sekooly", secret);
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        // Secret stocké mais 2FA pas encore activée tant que l'utilisateur n'a
        // pas confirmé avec un code valide (voir confirmTwoFactor).
        await auth_repository_1.authRepository.setTwoFactorSecret(userId, secret, false);
        return { secret, qrCodeDataUrl };
    },
    async confirmTwoFactor(userId, secret, otpCode) {
        const valid = otplib_1.authenticator.check(otpCode, secret);
        if (!valid) {
            throw new AppError_1.UnauthorizedError("Code invalide, activation 2FA annulée");
        }
        await auth_repository_1.authRepository.setTwoFactorSecret(userId, secret, true);
    },
    async disableTwoFactor(userId) {
        await auth_repository_1.authRepository.setTwoFactorSecret(userId, null, false);
    },
};
//# sourceMappingURL=auth.service.js.map