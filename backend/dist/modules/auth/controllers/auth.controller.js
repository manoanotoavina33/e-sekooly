"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const auth_service_1 = require("../services/auth.service");
const REFRESH_COOKIE = "e_sekooly_refresh_token";
const isProd = process.env.NODE_ENV === "production";
function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
}
exports.authController = {
    register: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_1.authService.register(req.body);
        res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
    }),
    login: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.login(req.body, {
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        if (result.requiresTwoFactor) {
            return res.status(200).json({ success: true, requiresTwoFactor: true });
        }
        setRefreshCookie(res, result.refreshToken);
        res.status(200).json({
            success: true,
            data: { accessToken: result.accessToken, user: result.user },
        });
    }),
    refresh: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const token = req.body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
        if (!token) {
            return res.status(401).json({ success: false, code: "NO_REFRESH_TOKEN" });
        }
        const result = await auth_service_1.authService.refresh(token);
        setRefreshCookie(res, result.refreshToken);
        res.status(200).json({ success: true, data: { accessToken: result.accessToken } });
    }),
    logout: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const token = req.body?.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
        if (token) {
            await auth_service_1.authService.logout(token);
        }
        res.clearCookie(REFRESH_COOKIE);
        res.status(200).json({ success: true });
    }),
    setupTwoFactor: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { secret, qrCodeDataUrl } = await auth_service_1.authService.generateTwoFactorSetup(req.auth.userId, req.body.email);
        res.status(200).json({ success: true, data: { secret, qrCodeDataUrl } });
    }),
    confirmTwoFactor: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.confirmTwoFactor(req.auth.userId, req.body.secret, req.body.otpCode);
        res.status(200).json({ success: true });
    }),
    disableTwoFactor: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await auth_service_1.authService.disableTwoFactor(req.auth.userId);
        res.status(200).json({ success: true });
    }),
    me: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        res.status(200).json({ success: true, data: req.auth });
    }),
};
//# sourceMappingURL=auth.controller.js.map