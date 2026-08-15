"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCsv = toCsv;
function escapeCsvValue(value) {
    if (value.includes(";") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
/**
 * Génère un CSV (séparateur ";" pour une bonne compatibilité Excel FR) à
 * partir de lignes d'objets et d'une définition de colonnes.
 */
function toCsv(columns, rows) {
    const header = columns.map((c) => escapeCsvValue(c.header)).join(";");
    const lines = rows.map((row) => columns
        .map((col) => {
        const raw = row[col.key];
        const formatted = col.format ? col.format(raw) : String(raw ?? "");
        return escapeCsvValue(formatted);
    })
        .join(";"));
    // BOM UTF-8 pour qu'Excel affiche correctement les accents.
    return "\uFEFF" + [header, ...lines].join("\n");
}
//# sourceMappingURL=csvExport.js.map