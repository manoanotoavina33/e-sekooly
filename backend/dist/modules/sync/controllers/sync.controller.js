"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const sync_service_1 = require("../services/sync.service");
exports.syncController = {
    pull: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await sync_service_1.syncService.pull(req.query);
        res.json({ success: true, ...result });
    }),
    push: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await sync_service_1.syncService.push(req.body);
        res.json({ success: true, ...result });
    }),
    history: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const schoolId = req.query.schoolId;
        const history = await sync_service_1.syncService.history(schoolId);
        res.json({ success: true, data: history });
    }),
};
//# sourceMappingURL=sync.controller.js.map