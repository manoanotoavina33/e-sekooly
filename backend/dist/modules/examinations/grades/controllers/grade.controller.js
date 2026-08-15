"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const grade_service_1 = require("../services/grade.service");
exports.gradeController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const grades = await grade_service_1.gradeService.list(req.query);
        res.json({ success: true, data: grades });
    }),
    bulkSave: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const grades = await grade_service_1.gradeService.bulkSave(req.body);
        res.status(201).json({ success: true, data: grades });
    }),
};
//# sourceMappingURL=grade.controller.js.map