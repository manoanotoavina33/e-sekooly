"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authenticate_1 = require("../../../core/middlewares/authenticate");
const validate_1 = require("../../../core/middlewares/validate");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validation_1 = require("../validations/auth.validation");
exports.authRouter = (0, express_1.Router)();
// Anti brute-force sur les endpoints sensibles.
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, code: "TOO_MANY_ATTEMPTS", message: "Trop de tentatives, réessayez plus tard" },
});
exports.authRouter.post("/register", (0, validate_1.validateBody)(auth_validation_1.registerUserSchema), auth_controller_1.authController.register);
exports.authRouter.post("/login", loginLimiter, (0, validate_1.validateBody)(auth_validation_1.loginSchema), auth_controller_1.authController.login);
exports.authRouter.post("/refresh", (0, validate_1.validateBody)(auth_validation_1.refreshSchema.partial()), auth_controller_1.authController.refresh);
exports.authRouter.post("/logout", auth_controller_1.authController.logout);
exports.authRouter.get("/me", authenticate_1.authenticate, auth_controller_1.authController.me);
exports.authRouter.post("/2fa/setup", authenticate_1.authenticate, auth_controller_1.authController.setupTwoFactor);
exports.authRouter.post("/2fa/confirm", authenticate_1.authenticate, (0, validate_1.validateBody)(auth_validation_1.enable2faSchema.extend({})), auth_controller_1.authController.confirmTwoFactor);
exports.authRouter.post("/2fa/disable", authenticate_1.authenticate, auth_controller_1.authController.disableTwoFactor);
//# sourceMappingURL=auth.routes.js.map