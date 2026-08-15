"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCardController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const reportcard_service_1 = require("../services/reportcard.service");
const reportcardPdf_1 = require("../utils/reportcardPdf");
exports.reportCardController = {
    get: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const report = await reportcard_service_1.reportCardService.generate(req.params.examSessionId, req.params.studentId);
        res.json({ success: true, data: report });
    }),
    getPdf: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const report = await reportcard_service_1.reportCardService.generate(req.params.examSessionId, req.params.studentId);
        await (0, reportcardPdf_1.streamReportCardPdf)(res, report);
    }),
};
//# sourceMappingURL=reportcard.controller.js.map