"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashRegisterController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const cashRegister_service_1 = require("../services/cashRegister.service");
exports.cashRegisterController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const registers = await cashRegister_service_1.cashRegisterService.list(req.query);
        res.json({ success: true, data: registers });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const register = await cashRegister_service_1.cashRegisterService.create(req.body);
        res.status(201).json({ success: true, data: register });
    }),
};
//# sourceMappingURL=cashRegister.controller.js.map