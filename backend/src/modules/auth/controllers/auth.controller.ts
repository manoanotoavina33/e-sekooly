import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { authService } from "../services/auth.service";
import {
  Enable2faInput,
  LoginInput,
  RefreshInput,
  RegisterUserInput,
} from "../validations/auth.validation";

const REFRESH_COOKIE = "e_sekooly_refresh_token";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export const authController = {
  register: asyncHandler(async (req: Request<unknown, unknown, RegisterUserInput>, res: Response) => {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: { id: user.id, email: user.email } });
  }),

  login: asyncHandler(async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
    const result = await authService.login(req.body, {
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

  refresh: asyncHandler(async (req: Request<unknown, unknown, Partial<RefreshInput>>, res: Response) => {
    const token = req.body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ success: false, code: "NO_REFRESH_TOKEN" });
    }
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ success: true, data: { accessToken: result.accessToken } });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE);
    res.status(200).json({ success: true });
  }),

  setupTwoFactor: asyncHandler(async (req: Request, res: Response) => {
    const { secret, qrCodeDataUrl } = await authService.generateTwoFactorSetup(
      req.auth!.userId,
      req.body.email
    );
    res.status(200).json({ success: true, data: { secret, qrCodeDataUrl } });
  }),

  confirmTwoFactor: asyncHandler(
    async (req: Request<unknown, unknown, Enable2faInput & { secret: string }>, res: Response) => {
      await authService.confirmTwoFactor(req.auth!.userId, req.body.secret, req.body.otpCode);
      res.status(200).json({ success: true });
    }
  ),

  disableTwoFactor: asyncHandler(async (req: Request, res: Response) => {
    await authService.disableTwoFactor(req.auth!.userId);
    res.status(200).json({ success: true });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: req.auth });
  }),
};
