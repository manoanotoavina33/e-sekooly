"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const notification_service_1 = require("../services/notification.service");
exports.notificationController = {
    listMine: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const notifications = await notification_service_1.notificationService.listForUser(req.auth.userId, query.unreadOnly);
        res.json({ success: true, data: notifications });
    }),
    markRead: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await notification_service_1.notificationService.markRead(req.params.id, req.auth.userId);
        res.json({ success: true });
    }),
    markAllRead: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await notification_service_1.notificationService.markAllRead(req.auth.userId);
        res.json({ success: true });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const notification = await notification_service_1.notificationService.create(req.body);
        res.status(201).json({ success: true, data: notification });
    }),
};
//# sourceMappingURL=notification.controller.js.map