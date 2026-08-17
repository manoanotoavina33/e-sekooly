"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const message_service_1 = require("../services/message.service");
exports.messageController = {
    send: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const message = await message_service_1.messageService.send(req.body, req.auth.userId);
        res.status(201).json({ success: true, data: message });
    }),
    inbox: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const messages = await message_service_1.messageService.inbox(req.auth.userId);
        res.json({ success: true, data: messages });
    }),
    sent: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const messages = await message_service_1.messageService.sent(req.auth.userId);
        res.json({ success: true, data: messages });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const message = await message_service_1.messageService.getById(req.params.id, req.auth.userId);
        res.json({ success: true, data: message });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const message = await message_service_1.messageService.update(req.params.id, req.auth.userId, req.body);
        res.json({ success: true, data: message });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await message_service_1.messageService.delete(req.params.id, req.auth.userId);
        res.json({ success: true });
    }),
    markRead: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await message_service_1.messageService.markRead(req.params.id, req.auth.userId);
        res.json({ success: true });
    }),
};
//# sourceMappingURL=message.controller.js.map