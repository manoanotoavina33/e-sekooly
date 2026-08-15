"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const backup_service_1 = require("../services/backup.service");
exports.backupController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const backups = await backup_service_1.backupService.list(query.schoolId);
        res.json({ success: true, data: backups });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { json, fileName } = await backup_service_1.backupService.createBackup(req.body.schoolId, req.auth?.userId);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(json);
    }),
    restore: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const results = await backup_service_1.backupService.restore(req.body);
        res.json({ success: true, data: results });
    }),
};
//# sourceMappingURL=backup.controller.js.map