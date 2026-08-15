"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashSessionController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const cashSession_service_1 = require("../services/cashSession.service");
exports.cashSessionController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const sessions = await cashSession_service_1.cashSessionService.list(req.query);
        res.json({ success: true, data: sessions });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await cashSession_service_1.cashSessionService.getById(req.params.id);
        res.json({ success: true, data: session });
    }),
    open: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await cashSession_service_1.cashSessionService.open(req.body, req.auth.userId);
        res.status(201).json({ success: true, data: session });
    }),
    close: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const session = await cashSession_service_1.cashSessionService.close(req.params.id, req.body.declaredClosingBalance, req.auth.userId);
        res.json({ success: true, data: session });
    }),
    journal: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { category, month, year, limit } = req.query;
        const entries = await cashSession_service_1.cashSessionService.getJournal(req.params.id, {
            category: category || undefined,
            month: month ? Number(month) : undefined,
            year: year ? Number(year) : undefined,
            limit: limit ? Number(limit) : 10,
        });
        res.json({ success: true, data: entries });
    }),
};
//# sourceMappingURL=cashSession.controller.js.map