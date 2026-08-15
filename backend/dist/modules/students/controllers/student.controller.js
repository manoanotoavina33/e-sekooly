"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const student_service_1 = require("../services/student.service");
exports.studentController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await student_service_1.studentService.list(req.query, req.auth);
        res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const student = await student_service_1.studentService.getById(req.params.id, req.auth);
        res.json({ success: true, data: student });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const student = await student_service_1.studentService.create(req.body);
        res.status(201).json({ success: true, data: student });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const student = await student_service_1.studentService.update(req.params.id, req.body);
        res.json({ success: true, data: student });
    }),
    changeClass: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await student_service_1.studentService.changeClass(req.params.id, req.body);
        res.json({ success: true });
    }),
    suspend: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await student_service_1.studentService.suspendOrExclude(req.params.id, req.body);
        res.json({ success: true });
    }),
    reactivate: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await student_service_1.studentService.reactivate(req.params.id);
        res.json({ success: true });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await student_service_1.studentService.delete(req.params.id);
        res.json({ success: true });
    }),
};
//# sourceMappingURL=student.controller.js.map