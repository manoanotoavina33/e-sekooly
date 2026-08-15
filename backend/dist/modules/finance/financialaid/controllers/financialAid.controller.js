"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAidController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const financialAid_service_1 = require("../services/financialAid.service");
exports.financialAidController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const aids = await financialAid_service_1.financialAidService.list(req.query);
        res.json({ success: true, data: aids });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const aid = await financialAid_service_1.financialAidService.create(req.body);
        res.status(201).json({ success: true, data: aid });
    }),
};
//# sourceMappingURL=financialAid.controller.js.map