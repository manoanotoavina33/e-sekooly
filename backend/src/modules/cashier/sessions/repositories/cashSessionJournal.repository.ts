import { prisma } from "../../../../config/prisma";

/**
 * Catégories de frais considérées comme "formation / écolage" pour
 * lesquelles on affiche le mois couvert par la facture.
 */
const TUITION_KEYWORDS = [
  "formation",
  "ecolage",
  "écolage",
  "scolarit",
  "inscription",
  "mensualit",
];

function isTuitionCategory(name: string): boolean {
  const lower = name.toLowerCase();
  return TUITION_KEYWORDS.some((kw) => lower.includes(kw));
}

export interface JournalPaymentEntry {
  id: string;
  receiptNo: string;
  amount: number;
  method: string;
  paidAt: string;
  studentName: string;
  studentRegistrationNo: string;
  className: string | null;
  feeCategoryName: string;
  invoiceNo: string;
  invoiceId: string;
  /** Mois couvert (ex: "Août 2026") — rempli uniquement si catégorie écolage/formation */
  coveredMonth: string | null;
  /** Mois numérique (1-12) pour le filtre */
  coveredMonthNum: number | null;
  coveredYear: number | null;
}

export const cashSessionJournalRepository = {
  async listJournalPayments(
    session: { id: string; openedAt: Date; closedAt: Date | null; cashRegister: { schoolId: string } },
    filters: { category?: string; month?: number; year?: number; limit?: number }
  ): Promise<JournalPaymentEntry[]> {
    const schoolId = session.cashRegister.schoolId;
    const from = session.openedAt;
    const to = session.closedAt ?? new Date();

    // Tous les paiements enregistrés durant la session
    const payments = await prisma.payment.findMany({
      where: {
        paidAt: { gte: from, lte: to },
        invoice: { is: { schoolId } },
      },
      include: {
        invoice: {
          include: {
            student: { select: { firstName: true, lastName: true, registrationNo: true, classRoom: { select: { name: true } } } },
            feeCategory: { select: { name: true } },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const MONTH_NAMES = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    // Construire les entrées enrichies
    let entries: JournalPaymentEntry[] = payments.map((p) => {
      let cat = p.invoice.feeCategory.name;
      const note = p.note ?? "";
      
      // Extraction si motif dans la note
      if (cat === "Paiement Manuel" && note) {
        const cleanNote = note.split(" — ")[0]; // extrait le motif principal
        const motifWithoutMonth = cleanNote.replace(/\s*\[Mois:.*?\]/, "").trim();
        if (motifWithoutMonth) {
          cat = motifWithoutMonth;
        }
      }

      const isTuition = isTuitionCategory(cat);
      const paidDate = new Date(p.paidAt);

      let coveredMonth: string | null = null;
      let coveredMonthNum: number | null = null;
      let coveredYear: number | null = null;

      // Vérifier si un mois spécifique est inscrit dans la note (ex: [Mois: Septembre 2026])
      const monthMatch = note.match(/\[Mois:\s*([A-Za-zÉéû]+)\s*(\d{4})\]/);
      if (monthMatch) {
        const monthStr = monthMatch[1];
        const yearNum = parseInt(monthMatch[2], 10);
        const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
        if (monthIdx !== -1) {
          coveredMonthNum = monthIdx + 1;
          coveredYear = yearNum;
          coveredMonth = `${MONTH_NAMES[monthIdx]} ${yearNum}`;
        }
      }

      // Si c'est des frais de scolarité/écolage/formation et pas encore extrait
      if (isTuition && !coveredMonth) {
        coveredMonthNum = paidDate.getMonth() + 1;
        coveredYear = paidDate.getFullYear();
        coveredMonth = paidDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      }

      return {
        id: p.id,
        receiptNo: p.receiptNo,
        amount: p.amount,
        method: p.method,
        paidAt: p.paidAt.toISOString(),
        studentName: `${p.invoice.student.firstName} ${p.invoice.student.lastName}`,
        studentRegistrationNo: p.invoice.student.registrationNo,
        className: p.invoice.student.classRoom?.name ?? null,
        feeCategoryName: cat,
        invoiceNo: p.invoice.invoiceNo,
        invoiceId: p.invoice.id,
        coveredMonth,
        coveredMonthNum,
        coveredYear,
      };
    });

    // Filtres dynamiques
    if (filters.category) {
      const catLower = filters.category.toLowerCase();
      entries = entries.filter((e) => e.feeCategoryName.toLowerCase() === catLower || e.feeCategoryName.toLowerCase().includes(catLower));
    }
    if (filters.month != null) {
      entries = entries.filter((e) => e.coveredMonthNum === filters.month);
    }
    if (filters.year != null) {
      entries = entries.filter((e) => e.coveredYear === filters.year);
    }

    // Limiter aux N derniers
    return entries.slice(0, filters.limit ?? 10);
  },
};
