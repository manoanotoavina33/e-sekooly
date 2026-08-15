"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalService = void 0;
const journal_repository_1 = require("../repositories/journal.repository");
exports.journalService = {
    list(query) {
        return journal_repository_1.journalRepository.list(query);
    },
    /** Saisie manuelle d'une écriture comptable équilibrée (débit = crédit). */
    createManualEntry(input, createdBy) {
        return journal_repository_1.journalRepository.create({
            schoolId: input.schoolId,
            date: input.date ?? new Date(),
            label: input.label,
            sourceType: "MANUAL",
            createdBy,
            lines: {
                create: input.lines.map((line) => ({
                    debit: line.debit,
                    credit: line.credit,
                    account: { connect: { id: line.accountId } },
                })),
            },
        });
    },
    ledgerForAccount(query) {
        return journal_repository_1.journalRepository.ledgerForAccount(query);
    },
    balance(query) {
        return journal_repository_1.journalRepository.balance(query);
    },
};
//# sourceMappingURL=journal.service.js.map