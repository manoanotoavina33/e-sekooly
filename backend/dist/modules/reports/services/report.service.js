"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const AppError_1 = require("../../../core/errors/AppError");
const reportDefinitions_1 = require("../definitions/reportDefinitions");
const csvExport_1 = require("../utils/csvExport");
const xlsxExport_1 = require("../utils/xlsxExport");
exports.reportService = {
    list() {
        return reportDefinitions_1.REPORT_DEFINITIONS.map((r) => ({ id: r.id, label: r.label, module: r.module, description: r.description }));
    },
    async exportCsv(reportId, query) {
        const definition = (0, reportDefinitions_1.getReportDefinition)(reportId);
        if (!definition)
            throw new AppError_1.NotFoundError("Rapport");
        const rows = await definition.fetch(query);
        return { filename: `${reportId}.csv`, content: (0, csvExport_1.toCsv)(definition.columns, rows) };
    },
    async exportXlsx(reportId, query) {
        const definition = (0, reportDefinitions_1.getReportDefinition)(reportId);
        if (!definition)
            throw new AppError_1.NotFoundError("Rapport");
        const rows = await definition.fetch(query);
        const buffer = await (0, xlsxExport_1.toXlsx)(definition.label, definition.columns, rows);
        return { filename: `${reportId}.xlsx`, buffer };
    },
    async getForPdf(reportId, query) {
        const definition = (0, reportDefinitions_1.getReportDefinition)(reportId);
        if (!definition)
            throw new AppError_1.NotFoundError("Rapport");
        const rows = await definition.fetch(query);
        return { title: definition.label, columns: definition.columns, rows };
    },
    validateReportId(reportId) {
        if (!(0, reportDefinitions_1.getReportDefinition)(reportId)) {
            throw new AppError_1.ValidationError(`Rapport inconnu : ${reportId}`);
        }
    },
};
//# sourceMappingURL=report.service.js.map