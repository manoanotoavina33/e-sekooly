import { NotFoundError, ValidationError } from "../../../core/errors/AppError";
import { getReportDefinition, REPORT_DEFINITIONS } from "../definitions/reportDefinitions";
import { toCsv } from "../utils/csvExport";
import { toXlsx } from "../utils/xlsxExport";
import { ExportReportQuery } from "../validations/report.validation";

export const reportService = {
  list() {
    return REPORT_DEFINITIONS.map((r) => ({ id: r.id, label: r.label, module: r.module, description: r.description }));
  },

  async exportCsv(reportId: string, query: ExportReportQuery) {
    const definition = getReportDefinition(reportId);
    if (!definition) throw new NotFoundError("Rapport");
    const rows = await definition.fetch(query);
    return { filename: `${reportId}.csv`, content: toCsv(definition.columns, rows) };
  },

  async exportXlsx(reportId: string, query: ExportReportQuery) {
    const definition = getReportDefinition(reportId);
    if (!definition) throw new NotFoundError("Rapport");
    const rows = await definition.fetch(query);
    const buffer = await toXlsx(definition.label, definition.columns, rows);
    return { filename: `${reportId}.xlsx`, buffer };
  },

  async getForPdf(reportId: string, query: ExportReportQuery) {
    const definition = getReportDefinition(reportId);
    if (!definition) throw new NotFoundError("Rapport");
    const rows = await definition.fetch(query);
    return { title: definition.label, columns: definition.columns, rows };
  },

  validateReportId(reportId: string) {
    if (!getReportDefinition(reportId)) {
      throw new ValidationError(`Rapport inconnu : ${reportId}`);
    }
  },
};
