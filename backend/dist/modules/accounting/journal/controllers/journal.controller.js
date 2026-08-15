"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const journal_service_1 = require("../services/journal.service");
exports.journalController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const entries = await journal_service_1.journalService.list(req.query);
        res.json({ success: true, data: entries });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const entry = await journal_service_1.journalService.createManualEntry(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: entry });
    }),
    ledger: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const lines = await journal_service_1.journalService.ledgerForAccount(req.query);
        res.json({ success: true, data: lines });
    }),
    balance: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const balance = await journal_service_1.journalService.balance(req.query);
        res.json({ success: true, data: balance });
    }),
};
//# sourceMappingURL=journal.controller.js.map