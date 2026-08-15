"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplineController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const discipline_service_1 = require("../services/discipline.service");
exports.disciplineController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const records = await discipline_service_1.disciplineService.list(req.query);
        res.json({ success: true, data: records });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const record = await discipline_service_1.disciplineService.create(req.body, req.auth?.userId);
        res.status(201).json({ success: true, data: record });
    }),
    summary: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const summary = await discipline_service_1.disciplineService.summary(req.params.studentId);
        res.json({ success: true, data: summary });
    }),
};
//# sourceMappingURL=discipline.controller.js.map