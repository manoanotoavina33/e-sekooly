"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamReceiptPdf = streamReceiptPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
const METHOD_LABELS = {
    CASH: "Espèces",
    MOBILE_MONEY: "Mobile Money",
    BANK_TRANSFER: "Virement bancaire",
    CARD: "Carte bancaire",
    CHEQUE: "Chèque",
};
function formatAr(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
/**
 * Génère le reçu de paiement au format A4, imprimable/téléchargeable —
 * modèle de reçu restant constant après chaque paiement.
 */
function streamReceiptPdf(res, receipt) {
    const doc = new pdfkit_1.default({ margin: 42, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="recu-${receipt.receiptNo}.pdf"`);
    doc.pipe(res);
    // ── Header ──
    doc.roundedRect(42, 40, 40, 40, 10).fill("#2389DE");
    doc.fillColor("white").fontSize(18).font("Helvetica-Bold").text("e", 56, 52);
    doc.fillColor("#125597").fontSize(20).font("Helvetica-Bold").text("e-sekooly", 92, 48);
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(receipt.schoolName ?? "Reçu de paiement", 92, 70);
    doc.moveDown(3);
    doc.fontSize(14).fillColor("#0f172a").font("Helvetica-Bold").text(`Reçu N° ${receipt.receiptNo}`, { align: "center" });
    doc.moveDown(1.5);
    // ── Details rows ──
    const rows = [
        ["Élève", `${receipt.studentName} (${receipt.studentRegistrationNo})`],
        ["Classe", receipt.studentClassName ?? "—"],
        ["Facture", receipt.invoiceNo],
        ["Catégorie", receipt.feeCategoryName],
        ["Montant versé", `${formatAr(receipt.amount)} Ar`],
        ["Mode de paiement", METHOD_LABELS[receipt.method] ?? receipt.method],
        ["Date", receipt.paidAt.toLocaleString("fr-FR")],
    ];
    if (receipt.cashierName) {
        rows.push(["Caissier", receipt.cashierName]);
    }
    let y = doc.y;
    const valueX = 220;
    for (const [label, value] of rows) {
        doc.fontSize(10).fillColor("#94a3b8").font("Helvetica").text(label, 42, y);
        doc.fontSize(11).fillColor("#0f172a").font("Helvetica").text(value, valueX, y);
        y += 24;
    }
    // ── Separator + signature ──
    y += 20;
    doc.moveTo(42, y).lineTo(220, y).strokeColor("#94a3b8").stroke();
    doc.fontSize(9).fillColor("#64748b").font("Helvetica").text("Signature / Cachet", 42, y + 6);
    // ── Footer ──
    doc.fontSize(8).fillColor("#94a3b8").font("Helvetica").text("Merci pour votre paiement. Conservez ce reçu.", 42, doc.page.height - 60, { align: "center" });
    doc.end();
}
//# sourceMappingURL=receiptPdf.js.map