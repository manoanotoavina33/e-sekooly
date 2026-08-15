import { NotFoundError } from "../../../../core/errors/AppError";
import { financialAidService } from "../../financialaid/services/financialAid.service";
import { invoiceRepository } from "../repositories/invoice.repository";
import { CreateInvoiceInput, ListInvoicesQuery } from "../validations/invoice.validation";

async function generateInvoiceNumber(schoolId: string) {
  const year = new Date().getFullYear();
  const count = await invoiceRepository.countBySchoolAndYear(schoolId, year);
  return `FAC-${year}-${String(count + 1).padStart(6, "0")}`;
}

/** Recalcule le statut d'une facture à partir du montant payé et de l'échéance. */
export function computeInvoiceStatus(params: {
  amountDue: number;
  amountPaid: number;
  dueDate: Date | null;
}): "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" {
  if (params.amountPaid >= params.amountDue && params.amountDue > 0) return "PAID";
  if (params.amountPaid > 0) return "PARTIAL";
  if (params.dueDate && params.dueDate < new Date()) return "OVERDUE";
  return "PENDING";
}

export const invoiceService = {
  list(query: ListInvoicesQuery) {
    return invoiceRepository.list(query);
  },

  async getById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) throw new NotFoundError("Facture");
    return invoice;
  },

  /**
   * Génère une facture pour un élève en appliquant automatiquement les
   * bourses/réductions actives (exigence "Bourses / Réductions" appliquées
   * aux "Frais scolaires").
   */
  async create(input: CreateInvoiceInput) {
    const discountAmount = await financialAidService.computeDiscount(input.studentId, input.amount);
    const invoiceNo = await generateInvoiceNumber(input.schoolId);

    return invoiceRepository.create({
      schoolId: input.schoolId,
      invoiceNo,
      amount: input.amount,
      discountAmount,
      dueDate: input.dueDate,
      student: { connect: { id: input.studentId } },
      feeCategory: { connect: { id: input.feeCategoryId } },
    } as never);
  },

  financeSummary(schoolId: string) {
    return invoiceRepository.financeSummary(schoolId);
  },
};
