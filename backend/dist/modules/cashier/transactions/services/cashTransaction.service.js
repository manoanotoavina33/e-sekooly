"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashTransactionService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const accountingIntegration_service_1 = require("../../../accounting/journal/services/accountingIntegration.service");
const cashTransaction_repository_1 = require("../repositories/cashTransaction.repository");
async function generateReceiptNumber() {
    const year = new Date().getFullYear();
    const count = await cashTransaction_repository_1.cashTransactionRepository.countByYear(year);
    return `CAI-${year}-${String(count + 1).padStart(6, "0")}`;
}
exports.cashTransactionService = {
    list(query) {
        return cashTransaction_repository_1.cashTransactionRepository.list(query);
    },
    async getById(id) {
        const transaction = await cashTransaction_repository_1.cashTransactionRepository.findById(id);
        if (!transaction)
            throw new AppError_1.NotFoundError("Mouvement de caisse");
        return transaction;
    },
    /**
     * Enregistre une entrée ou une sortie de caisse. Le mouvement démarre en
     * statut PENDING et doit être validé (exigence "Validation") avant d'être
     * comptabilisé dans le solde attendu de la session.
     */
    async record(input, recordedBy) {
        const session = await cashTransaction_repository_1.cashTransactionRepository.findSession(input.cashSessionId);
        if (!session)
            throw new AppError_1.NotFoundError("Session de caisse");
        if (session.status === "CLOSED") {
            throw new AppError_1.ConflictError("Cette session de caisse est clôturée, aucun mouvement ne peut y être ajouté");
        }
        const receiptNo = await generateReceiptNumber();
        return cashTransaction_repository_1.cashTransactionRepository.create({
            type: input.type,
            amount: input.amount,
            category: input.category,
            description: input.description,
            status: "PENDING",
            receiptNo,
            recordedBy,
            cashSession: { connect: { id: input.cashSessionId } },
        });
    },
    async validate(id, status, validatedBy) {
        const transaction = await this.getById(id);
        if (transaction.status !== "PENDING") {
            throw new AppError_1.ConflictError("Ce mouvement a déjà été traité");
        }
        const updated = await cashTransaction_repository_1.cashTransactionRepository.updateStatus(id, status, validatedBy);
        if (status === "VALIDATED") {
            // Comptabilisation automatique (Module 10) — best effort, ne bloque pas la validation.
            await (0, accountingIntegration_service_1.postCashTransactionToJournal)({
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
//# sourceMappingURL=cashTransaction.service.js.map