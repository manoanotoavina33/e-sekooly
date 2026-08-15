import { Response } from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { ReportCard } from "../services/reportcard.service";

/**
 * Génère le bulletin PDF d'un élève : en-tête avec logo e-sekooly, tableau
 * des matières/moyennes/coefficients, moyenne générale, rang, mention, QR
 * code (identité + vérification), et ligne de signature — exigences
 * "Génération automatique / Logo / Signature / QR Code / PDF / Impression".
 */
export async function streamReportCardPdf(res: Response, report: ReportCard) {
  const doc = new PDFDocument({ margin: 42, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="bulletin-${report.student.registrationNo}.pdf"`
  );
  doc.pipe(res);

  // En-tête / logo (wordmark stylisé, cohérent avec l'identité visuelle e-sekooly)
  doc.roundedRect(42, 40, 40, 40, 10).fill("#2389DE");
  doc.fillColor("white").fontSize(18).text("e", 56, 52);
  doc.fillColor("#125597").fontSize(20).text("e-sekooly", 92, 48);
  doc.fillColor("#64748b").fontSize(9).text("Bulletin de résultats scolaires", 92, 70);

  doc.moveDown(3);
  doc.fillColor("#0f172a").fontSize(14).text(report.sessionLabel, { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(11)
    .fillColor("#334155")
    .text(`${report.student.firstName} ${report.student.lastName}  ·  Matricule ${report.student.registrationNo}`, {
      align: "center",
    });
  doc.fontSize(10).fillColor("#64748b").text(`Classe : ${report.classRoomName}`, { align: "center" });
  doc.moveDown(1.5);

  // Tableau des matières
  const tableTop = doc.y;
  const colX = { subject: 42, coef: 300, avg: 380, weighted: 460 };
  doc.fontSize(9).fillColor("#94a3b8");
  doc.text("Matière", colX.subject, tableTop);
  doc.text("Coeff.", colX.coef, tableTop);
  doc.text("Moyenne /20", colX.avg, tableTop);
  doc.text("Moy. pondérée", colX.weighted, tableTop);
  doc.moveTo(42, tableTop + 14).lineTo(553, tableTop + 14).strokeColor("#e2e8f0").stroke();

  let y = tableTop + 22;
  doc.fontSize(10).fillColor("#0f172a");
  for (const subject of report.subjects) {
    doc.text(subject.subjectName, colX.subject, y);
    doc.text(String(subject.coefficient), colX.coef, y);
    doc.text(subject.average.toFixed(2), colX.avg, y);
    doc.text((subject.average * subject.coefficient).toFixed(2), colX.weighted, y);
    y += 20;
  }

  doc.moveTo(42, y + 4).lineTo(553, y + 4).strokeColor("#e2e8f0").stroke();
  y += 16;

  doc.fontSize(12).fillColor("#125597").text(`Moyenne générale : ${report.overallAverage.toFixed(2)} / 20`, 42, y);
  y += 18;
  doc.fontSize(11).fillColor("#0f172a").text(`Rang : ${report.rank} / ${report.totalStudents}`, 42, y);
  y += 16;
  doc.fontSize(11).fillColor("#0f172a").text(`Mention : ${report.mention}`, 42, y);

  // QR code (vérification / identification rapide du bulletin)
  const qrDataUrl = await QRCode.toDataURL(
    `e-sekooly:report:${report.student.registrationNo}:${report.sessionLabel}`
  );
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
  doc.image(qrBuffer, 460, y - 40, { width: 90 });

  // Ligne de signature
  const signatureY = y + 80;
  doc.moveTo(42, signatureY).lineTo(220, signatureY).strokeColor("#94a3b8").stroke();
  doc.fontSize(9).fillColor("#64748b").text("Signature du Directeur / de la Directrice", 42, signatureY + 6);

  doc.moveTo(340, signatureY).lineTo(520, signatureY).strokeColor("#94a3b8").stroke();
  doc.fontSize(9).fillColor("#64748b").text("Cachet de l'établissement", 340, signatureY + 6);

  doc.end();
}
