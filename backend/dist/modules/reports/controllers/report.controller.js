"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const AppError_1 = require("../../../core/errors/AppError");
const report_service_1 = require("../services/report.service");
const pdfExport_1 = require("../utils/pdfExport");
exports.reportController = {
    list: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        res.json({ success: true, data: report_service_1.reportService.list() });
    }),
    export: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const reportId = req.params.id;
        if (query.format === "csv") {
            const { filename, content } = await report_service_1.reportService.exportCsv(reportId, query);
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            return res.send(content);
        }
        if (query.format === "xlsx") {
            const { filename, buffer } = await report_service_1.reportService.exportXlsx(reportId, query);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            return res.send(buffer);
        }
        if (query.format === "pdf") {
            const { title, columns, rows } = await report_service_1.reportService.getForPdf(reportId, query);
            return (0, pdfExport_1.streamReportPdf)(res, title, columns, rows);
        }
        throw new AppError_1.ValidationError("Format d'export invalide (csv, xlsx ou pdf attendu)");
    }),
};
//# sourceMappingURL=report.controller.js.map