"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toXlsx = toXlsx;
const exceljs_1 = __importDefault(require("exceljs"));
/**
 * Génère un classeur Excel (.xlsx) stylé (en-tête bleu ciel, colonnes
 * auto-dimensionnées) à partir de lignes d'objets et d'une définition de
 * colonnes — exigence "Export Excel".
 */
async function toXlsx(title, columns, rows) {
    const workbook = new exceljs_1.default.Workbook();
    workbook.creator = "e-sekooly";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(title.slice(0, 31) || "Rapport");
    sheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: Math.max(col.header.length + 4, 16),
    }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2389DE" } };
    sheet.getRow(1).alignment = { vertical: "middle" };
    for (const row of rows) {
        const formatted = {};
        for (const col of columns) {
            const raw = row[col.key];
            formatted[col.key] = col.format ? col.format(raw) : String(raw ?? "");
        }
        sheet.addRow(formatted);
    }
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
//# sourceMappingURL=xlsxExport.js.map