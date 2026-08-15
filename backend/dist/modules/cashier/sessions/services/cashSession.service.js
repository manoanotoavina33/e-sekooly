"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashSessionService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const cashSessionJournal_repository_1 = require("../repositories/cashSessionJournal.repository");
const cashSession_repository_1 = require("../repositories/cashSession.repository");
exports.cashSessionService = {
    list(query) {
        return cashSession_repository_1.cashSessionRepository.list(query);
    },
    async getById(id) {
        const session = await cashSession_repository_1.cashSessionRepository.findById(id);
        if (!session)
            throw new AppError_1.NotFoundError("Session de caisse");
        return this.attachBalance(session);
    },
    /** Calcule le solde attendu = solde d'ouverture + entrées validées - sorties validées. */
    async attachBalance(session) {
        const { totalIn, totalOut } = await cashSession_repository_1.cashSessionRepository.sumValidatedTransactions(session.id);
        const expectedBalance = session.openingBalance + totalIn - totalOut;
        return { ...session, totalIn, totalOut, expectedBalance };
    },
    /** Ouvre une nouvelle session — une seule session ouverte à la fois par caisse. */
    async open(input, openedBy) {
        const existing = await cashSession_repository_1.cashSessionRepository.findOpenForRegister(input.cashRegisterId);
        if (existing) {
            throw new AppError_1.ConflictError("Une session est déjà ouverte pour cette caisse. Fermez-la avant d'en ouvrir une nouvelle.");
        }
        return cashSession_repository_1.cashSessionRepository.create({
            openingBalance: input.openingBalance,
            openedBy,
            cashRegister: { connect: { id: input.cashRegisterId } },
        });
    },
    /** Ferme la session et calcule l'écart entre solde déclaré et solde attendu. */
    async close(id, declaredClosingBalance, closedBy) {
        const session = await cashSession_repository_1.cashSessionRepository.findById(id);
        if (!session)
            throw new AppError_1.NotFoundError("Session de caisse");
        if (session.status === "CLOSED") {
            throw new AppError_1.ConflictError("Cette session est déjà clôturée");
        }
        const { totalIn, totalOut } = await cashSession_repository_1.cashSessionRepository.sumValidatedTransactions(id);
        const expectedBalance = session.openingBalance + totalIn - totalOut;
        const closed = await cashSession_repository_1.cashSessionRepository.close(id, closedBy, declaredClosingBalance);
        return {
            ...closed,
            expectedBalance,
            difference: Math.round((declaredClosingBalance - expectedBalance) * 100) / 100,
        };
    },
    /** Journal enrichi des paiements élèves pour une session donnée. */
    async getJournal(sessionId, filters) {
        const session = await cashSession_repository_1.cashSessionRepository.findByIdForJournal(sessionId);
        if (!session)
            throw new AppError_1.NotFoundError("Session de caisse");
        return cashSessionJournal_repository_1.cashSessionJournalRepository.listJournalPayments({
            id: session.id,
            openedAt: session.openedAt,
            closedAt: session.closedAt,
            cashRegister: { schoolId: session.cashRegister.schoolId },
        }, filters);
    },
};
//# sourceMappingURL=cashSession.service.js.map