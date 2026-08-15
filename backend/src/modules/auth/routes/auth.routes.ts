import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../../core/middlewares/authenticate";
import { validateBody } from "../../../core/middlewares/validate";
import { authController } from "../controllers/auth.controller";
import {
  enable2faSchema,
  loginSchema,
  refreshSchema,
  registerUserSchema,
} from "../validations/auth.validation";

export const authRouter = Router();

// Anti brute-force sur les endpoints sensibles.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: "TOO_MANY_ATTEMPTS", message: "Trop de tentatives, réessayez plus tard" },
});

authRouter.post("/register", validateBody(registerUserSchema), authController.register);
authRouter.post("/login", loginLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshSchema.partial()), authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.get("/me", authenticate, authController.me);
authRouter.post("/2fa/setup", authenticate, authController.setupTwoFactor);
authRouter.post("/2fa/confirm", authenticate, validateBody(enable2faSchema.extend({})), authController.confirmTwoFactor);
authRouter.post("/2fa/disable", authenticate, authController.disableTwoFactor);
