import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { ValidationError } from "../../../core/errors/AppError";
import { reportService } from "../services/report.service";
import { streamReportPdf } from "../utils/pdfExport";
import { ExportReportQuery } from "../validations/report.validation";

export const reportController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ success: true, data: reportService.list() });
  }),

  export: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const query = req.query as unknown as ExportReportQuery;
    const reportId = req.params.id;

    if (query.format === "csv") {
      const { filename, content } = await reportService.exportCsv(reportId, query);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(content);
    }

    if (query.format === "xlsx") {
      const { filename, buffer } = await reportService.exportXlsx(reportId, query);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(buffer);
    }

    if (query.format === "pdf") {
      const { title, columns, rows } = await reportService.getForPdf(reportId, query);
      return streamReportPdf(res, title, columns, rows);
    }

    throw new ValidationError("Format d'export invalide (csv, xlsx ou pdf attendu)");
  }),
};
