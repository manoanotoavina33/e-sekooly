import { Response } from "express";
import PDFDocument from "pdfkit";

export interface AnnouncementPdfData {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: Date;
}

export async function streamAnnouncementPdf(res: Response, announcement: AnnouncementPdfData) {
  const doc = new PDFDocument({ margin: 42, size: [842, 595] });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="annonce-${announcement.id}.pdf"`
  );
  doc.pipe(res);

  doc.roundedRect(42, 40, 40, 40, 10).fill("#2389DE");
  doc.fillColor("white").fontSize(18).text("e", 56, 52);
  doc.fillColor("#125597").fontSize(20).text("e-sekooly", 92, 48);
  doc.fillColor("#64748b").fontSize(9).text("Annonce officielle", 92, 70);

  doc.moveDown(2);
  doc.fillColor("#0f172a").fontSize(16).text(announcement.title, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#334155").text(`Public : ${announcement.audience}`, { align: "center" });
  doc.moveDown(1);

  doc.fontSize(12).fillColor("#0f172a").text(announcement.body, { align: "left", lineGap: 6 });

  doc.moveDown(1.5);
  doc.fontSize(9).fillColor("#64748b").text(`Publiée le ${new Date(announcement.publishedAt).toLocaleDateString("fr-FR")}`, { align: "right" });

  doc.end();
}
