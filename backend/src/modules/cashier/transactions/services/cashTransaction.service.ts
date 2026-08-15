import { ConflictError, NotFoundError } from "../../../../core/errors/AppError";
import { postCashTransactionToJournal } from "../../../accounting/journal/services/accountingIntegration.service";
import { cashTransactionRepository } from "../repositories/cashTransaction.repository";
import { CreateCashTransactionInput } from "../validations/cashTransaction.validation";

async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const count = await cashTransactionRepository.countByYear(year);
  return `CAI-${year}-${String(count + 1).padStart(6, "0")}`;
}

export const cashTransactionService = {
  list(query: Parameters<typeof cashTransactionRepository.list>[0]) {
    return cashTransactionRepository.list(query);
  },

  async getById(id: string) {
    const transaction = await cashTransactionRepository.findById(id);
    if (!transaction) throw new NotFoundError("Mouvement de caisse");
    return transaction;
  },

  /**
   * Enregistre une entrée ou une sortie de caisse. Le mouvement démarre en
   * statut PENDING et doit être validé (exigence "Validation") avant d'être
   * comptabilisé dans le solde attendu de la session.
   */
  async record(input: CreateCashTransactionInput, recordedBy?: string) {
    const session = await cashTransactionRepository.findSession(input.cashSessionId);
    if (!session) throw new NotFoundError("Session de caisse");
    if (session.status === "CLOSED") {
      throw new ConflictError("Cette session de caisse est clôturée, aucun mouvement ne peut y être ajouté");
    }

    const receiptNo = await generateReceiptNumber();

    return cashTransactionRepository.create({
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      status: "PENDING",
      receiptNo,
      recordedBy,
      cashSession: { connect: { id: input.cashSessionId } },
    } as never);
  },

  async validate(id: string, status: "VALIDATED" | "REJECTED", validatedBy: string) {
    const transaction = await this.getById(id);
    if (transaction.status !== "PENDING") {
      throw new ConflictError("Ce mouvement a déjà été traité");
    }
    const updated = await cashTransactionRepository.updateStatus(id, status, validatedBy);

    if (status === "VALIDATED") {
      // Comptabilisation automatique (Module 10) — best effort, ne bloque pas la validation.
      await postCashTransactionToJournal({
        schoolId: transaction.cashSession.cashRegister.schoolId,
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
      });
    }

    return updated;
  },
};
