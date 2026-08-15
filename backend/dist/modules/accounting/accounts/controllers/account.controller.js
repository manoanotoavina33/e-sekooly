"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const account_service_1 = require("../services/account.service");
exports.accountController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const accounts = await account_service_1.accountService.list(req.query);
        res.json({ success: true, data: accounts });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const account = await account_service_1.accountService.create(req.body);
        res.status(201).json({ success: true, data: account });
    }),
};
//# sourceMappingURL=account.controller.js.map