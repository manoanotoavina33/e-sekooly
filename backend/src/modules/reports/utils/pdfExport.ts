import { Response } from "express";
import PDFDocument from "pdfkit";
import { ReportColumn } from "./csvExport";

/**
 * Génère un rapport PDF tabulaire (en-tête e-sekooly + tableau paginé) —
 * exigence "Export PDF / Impression professionnelle" appliquée à tous les
 * rapports.
 */
export function streamReportPdf(
  res: Response,
  title: string,
  columns: ReportColumn[],
  rows: Record<string, unknown>[]
) {
  const doc = new PDFDocument({ margin: 36, size: "A4", layout: columns.length > 5 ? "landscape" : "portrait" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="rapport.pdf"`);
  doc.pipe(res);

  const pageWidth = doc.page.width - 72;
  const colWidth = pageWidth / columns.length;

  function drawHeader() {
    doc.fontSize(14).fillColor("#125597").text(title, 36, 36);
    doc.fontSize(8).fillColor("#94a3b8").text(`Généré le ${new Date().toLocaleDateString("fr-FR")} — e-sekooly`, 36, 54);

    const tableTop = 78;
    doc.fontSize(9).fillColor("#94a3b8");
    columns.forEach((col, i) => {
      doc.text(col.header, 36 + i * colWidth, tableTop, { width: colWidth - 6 });
    });
    doc.moveTo(36, tableTop + 14).lineTo(36 + pageWidth, tableTop + 14).strokeColor("#e2e8f0").stroke();
    return tableTop + 22;
  }

  let y = drawHeader();

  for (const row of rows) {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = drawHeader();
    }
    doc.fontSize(8).fillColor("#0f172a");
    columns.forEach((col, i) => {
      const raw = row[col.key];
      const value = col.format ? col.format(raw) : String(raw ?? "");
      doc.text(value, 36 + i * colWidth, y, { width: colWidth - 6 });
    });
    y += 18;
  }

  if (rows.length === 0) {
    doc.fontSize(10).fillColor("#94a3b8").text("Aucune donnée pour ce rapport.", 36, y);
  }

  doc.end();
}
