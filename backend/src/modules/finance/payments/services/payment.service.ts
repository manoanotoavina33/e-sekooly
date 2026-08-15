import { NotFoundError, ValidationError } from "../../../../core/errors/AppError";
import { invoiceRepository } from "../../invoices/repositories/invoice.repository";
import { computeInvoiceStatus, invoiceService } from "../../invoices/services/invoice.service";
import { postPaymentToJournal } from "../../../accounting/journal/services/accountingIntegration.service";
import { paymentRepository } from "../repositories/payment.repository";
import { CreatePaymentInput } from "../validations/payment.validation";

async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const count = await paymentRepository.countBySchoolAndYear(year);
  return `REC-${year}-${String(count + 1).padStart(6, "0")}`;
}

export const paymentService = {
  list(opts?: { invoiceId?: string; schoolId?: string; month?: number; year?: number }) {
    return paymentRepository.list(opts);
  },

  studentPaymentStatus(schoolId: string, month: number, year: number) {
    return paymentRepository.studentPaymentStatus(schoolId, month, year);
  },

  async getById(id: string) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError("Paiement");
    return payment;
  },

  /**
   * Enregistre un versement, génère son reçu, puis recalcule et met à jour
   * automatiquement le statut de la facture (Pending/Partiel/Payé) —
   * exigence "Paiements / Versements" reliés aux "Factures".
   */
  async record(input: CreatePaymentInput, recordedBy?: string) {
    const invoice = await paymentRepository.findInvoice(input.invoiceId);
    if (!invoice) throw new NotFoundError("Facture");
    if (invoice.status === "CANCELLED") {
      throw new ValidationError("Cette facture a été annulée, aucun paiement ne peut y être ajouté");
    }

    const amountDue = invoice.amount - invoice.discountAmount;
    const receiptNo = await generateReceiptNumber();

    const payment = await paymentRepository.create({
      amount: input.amount,
      method: input.method,
      note: input.note,
      receiptNo,
      recordedBy,
      invoice: { connect: { id: input.invoiceId } },
    } as never);

    const totalPaid = await paymentRepository.sumForInvoice(input.invoiceId);
    const amountPaid = totalPaid._sum.amount ?? 0;
    const newStatus = computeInvoiceStatus({ amountDue, amountPaid, dueDate: invoice.dueDate });
    await invoiceRepository.updateStatus(input.invoiceId, newStatus);

    // Comptabilisation automatique (Module 10 : Comptabilité). Ne bloque pas
    // le paiement en cas d'échec (ex: contrainte future) — best effort.
    try {
      const fullPayment = await paymentRepository.findById(payment.id);
      if (fullPayment) {
        await postPaymentToJournal({
          schoolId: invoice.schoolId,
          paymentId: fullPayment.id,
          amount: fullPayment.amount,
          feeCategoryName: fullPayment.invoice.feeCategory.name,
          studentName: `${fullPayment.invoice.student.firstName} ${fullPayment.invoice.student.lastName}`,
        });
      }
    } catch (err) {
      console.warn("Accounting integration skipped/failed:", err);
    }

    return payment;
  },

  /**
   * Paiement rapide de caisse avec motif libre (crée la facture avec catégorie manuelle si nécessaire).
   */
  async recordQuickPayment(input: {
    schoolId: string;
    studentId: string;
    amount: number;
    method: any;
    motif: string;
    month?: number;
    year?: number;
    note?: string;
    invoiceId?: string;
  }, recordedBy?: string) {
    let targetInvoiceId = input.invoiceId;

    if (!targetInvoiceId) {
      const { feeCategoryRepository } = await import("../../categories/repositories/feeCategory.repository");
      const category = await feeCategoryRepository.findOrCreateManual(input.schoolId);

      const invoice = await invoiceService.create({
        schoolId: input.schoolId,
        studentId: input.studentId,
        feeCategoryId: category.id,
        amount: input.amount,
      });
      targetInvoiceId = invoice.id;
    }

    const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    let monthLabel = "";
    if (input.month && input.year) {
      monthLabel = ` [Mois: ${MONTHS[input.month - 1]} ${input.year}]`;
    }

    const fullMotif = `${input.motif}${monthLabel}`;
    const noteText = input.note ? `${fullMotif} — ${input.note}` : fullMotif;

    return this.record({
      invoiceId: targetInvoiceId,
      amount: input.amount,
      method: input.method,
      note: noteText,
    }, recordedBy);
  },
};
