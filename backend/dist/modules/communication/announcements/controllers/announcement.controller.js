"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const announcement_service_1 = require("../services/announcement.service");
const announcementPdf_1 = require("../utils/announcementPdf");
exports.announcementController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcements = await announcement_service_1.announcementService.list(req.query);
        res.json({ success: true, data: announcements });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcement = await announcement_service_1.announcementService.getById(req.params.id);
        res.json({ success: true, data: announcement });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcement = await announcement_service_1.announcementService.create(req.body, req.auth.userId);
        res.status(201).json({ success: true, data: announcement });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcement = await announcement_service_1.announcementService.update(req.params.id, req.body);
        res.json({ success: true, data: announcement });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await announcement_service_1.announcementService.delete(req.params.id);
        res.json({ success: true });
    }),
    getPdf: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const announcement = await announcement_service_1.announcementService.getById(req.params.id);
        await (0, announcementPdf_1.streamAnnouncementPdf)(res, announcement);
    }),
};
//# sourceMappingURL=announcement.controller.js.map