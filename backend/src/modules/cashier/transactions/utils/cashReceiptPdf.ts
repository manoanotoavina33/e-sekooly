import { Response } from "express";
import PDFDocument from "pdfkit";

interface CashReceiptData {
  receiptNo: string;
  type: "IN" | "OUT";
  amount: number;
  category: string;
  description: string | null;
  createdAt: Date;
  cashRegisterName: string;
  schoolName?: string;
}

const PAGE_SIZES: Record<string, [number, number]> = {
  "58mm": [164, 500],
  "80mm": [227, 500],
  A4: [595.28, 841.89],
};

function formatAr(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function streamCashReceiptPdf(res: Response, format: "58mm" | "80mm" | "A4", receipt: CashReceiptData) {
  const isThermal = format !== "A4";
  const doc = new PDFDocument({ size: PAGE_SIZES[format], margin: isThermal ? 10 : 42 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="caisse-${receipt.receiptNo}.pdf"`);
  doc.pipe(res);

  const typeLabel = receipt.type === "IN" ? "ENTRÉE D'ARGENT" : "SORTIE D'ARGENT";
  const amountPrefix = receipt.type === "IN" ? "+ " : "- ";

  if (isThermal) {
    // --- Header ---
    doc.fontSize(11).fillColor("#0f172a").font("Helvetica-Bold").text(receipt.schoolName ?? "e-sekooly", { align: "center" });
    doc.fontSize(7).fillColor("#64748b").font("Helvetica").text("Reçu de caisse", { align: "center" });
    doc.moveDown(0.6);

    // --- Receipt number & date ---
    doc.fontSize(8).fillColor("#0f172a").font("Helvetica");
    doc.text(`N° ${receipt.receiptNo}`);
    doc.text(`Date : ${receipt.createdAt.toLocaleString("fr-FR")}`);
    doc.moveDown(0.4);

    // --- Separator ---
    doc.moveTo(5, doc.y).lineTo(155, doc.y).strokeColor("#cbd5e1").lineWidth(0.5).stroke();
    doc.moveDown(0.4);

    // --- Details ---
    doc.fontSize(8).fillColor("#0f172a");
    doc.text(`Type : ${typeLabel}`);
    doc.text(`Catégorie : ${receipt.category}`);
    if (receipt.description) doc.text(`Détail : ${receipt.description}`);
    doc.text(`Caisse : ${receipt.cashRegisterName}`);
    doc.moveDown(0.6);

    // --- Amount ---
    doc.fontSize(12).fillColor("#059669").font("Helvetica-Bold");
    doc.text(`${amountPrefix}${formatAr(receipt.amount)} Ar`, { align: "center" });
    doc.moveDown(0.6);

    // --- Footer ---
    doc.fontSize(6).fillColor("#94a3b8").font("Helvetica");
    doc.text("Merci de votre confiance.", { align: "center" });
  } else {
    // --- A4 Header ---
    doc.roundedRect(42, 40, 40, 40, 10).fill("#2389DE");
    doc.fillColor("white").fontSize(18).font("Helvetica-Bold").text("e", 56, 52);
    doc.fillColor("#125597").fontSize(20).font("Helvetica-Bold").text("e-sekooly", 92, 48);
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(
      `Reçu de caisse — ${receipt.schoolName ?? receipt.cashRegisterName}`,
      92, 70
    );

    doc.moveDown(3);
    doc.fontSize(14).fillColor("#0f172a").font("Helvetica-Bold").text(`Reçu N° ${receipt.receiptNo}`, { align: "center" });
    doc.moveDown(1.5);

    // --- Details table ---
    const rows: [string, string][] = [
      ["Type", typeLabel],
      ["Catégorie", receipt.category],
      ["Description", receipt.description ?? "—"],
      [receipt.type === "IN" ? "Montant entrant" : "Montant sortant", `${amountPrefix}${formatAr(receipt.amount)} Ar`],
      ["Date", receipt.createdAt.toLocaleString("fr-FR")],
      ["Caisse", receipt.cashRegisterName],
    ];

    let y = doc.y;
    const labelWidth = 130;
    const valueX = 220;
    for (const [label, value] of rows) {
      doc.fontSize(9).fillColor("#94a3b8").font("Helvetica").text(label, 42, y);
      doc.fontSize(10).fillColor("#0f172a").font("Helvetica").text(value, valueX, y);
      y += 22;
    }

    // --- Total box ---
    y += 20;
    doc.moveTo(42, y).lineTo(553, y).strokeColor("#cbd5e1").lineWidth(0.5).stroke();
    y += 15;
    doc.fontSize(14).fillColor("#059669").font("Helvetica-Bold");
    doc.text(`Montant : ${amountPrefix}${formatAr(receipt.amount)} Ar`, 553, y, { align: "right" });
    doc.moveDown(2);

    // --- Footer / signature ---
    y = doc.y + 10;
    doc.moveTo(42, y).lineTo(220, y).strokeColor("#94a3b8").stroke();
    doc.fontSize(9).fillColor("#64748b").font("Helvetica").text("Signature", 42, y + 6);
  }

  doc.end();
}
