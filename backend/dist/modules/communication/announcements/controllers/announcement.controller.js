"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const announcement_service_1 = require("../services/announcement.service");
exports.announcementController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcements = await announcement_service_1.announcementService.list(req.query);
        res.json({ success: true, data: announcements });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcement = await announcement_service_1.announcementService.create(req.body, req.auth.userId);
        res.status(201).json({ success: true, data: announcement });
    }),
};
//# sourceMappingURL=announcement.controller.js.map