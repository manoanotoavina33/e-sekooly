"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const subject_service_1 = require("../services/subject.service");
exports.subjectController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const subjects = await subject_service_1.subjectService.list(req.query, req.auth);
        res.json({ success: true, data: subjects });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const subject = await subject_service_1.subjectService.getById(req.params.id, req.auth);
        res.json({ success: true, data: subject });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const subject = await subject_service_1.subjectService.create(req.body);
        res.status(201).json({ success: true, data: subject });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const subject = await subject_service_1.subjectService.update(req.params.id, req.body);
        res.json({ success: true, data: subject });
    }),
    remove: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await subject_service_1.subjectService.remove(req.params.id);
        res.status(204).send();
    }),
};
//# sourceMappingURL=subject.controller.js.map