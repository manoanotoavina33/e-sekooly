export interface ReportColumn {
  key: string;
  header: string;
  /** Formatte la valeur brute pour l'affichage (dates, montants, etc.). */
  format?: (value: unknown) => string;
}

function escapeCsvValue(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Génère un CSV (séparateur ";" pour une bonne compatibilité Excel FR) à
 * partir de lignes d'objets et d'une définition de colonnes.
 */
export function toCsv(columns: ReportColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => escapeCsvValue(c.header)).join(";");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key];
        const formatted = col.format ? col.format(raw) : String(raw ?? "");
        return escapeCsvValue(formatted);
      })
      .join(";")
  );
  // BOM UTF-8 pour qu'Excel affiche correctement les accents.
  return "\uFEFF" + [header, ...lines].join("\n");
}
