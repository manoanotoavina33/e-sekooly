import { ConflictError, NotFoundError } from "../../../../core/errors/AppError";
import { cashSessionJournalRepository } from "../repositories/cashSessionJournal.repository";
import { cashSessionRepository } from "../repositories/cashSession.repository";
import { OpenCashSessionInput } from "../validations/cashSession.validation";

export const cashSessionService = {
  list(query: Parameters<typeof cashSessionRepository.list>[0]) {
    return cashSessionRepository.list(query);
  },

  async getById(id: string) {
    const session = await cashSessionRepository.findById(id);
    if (!session) throw new NotFoundError("Session de caisse");
    return this.attachBalance(session);
  },

  /** Calcule le solde attendu = solde d'ouverture + entrées validées - sorties validées. */
  async attachBalance<T extends { id: string; openingBalance: number }>(session: T) {
    const { totalIn, totalOut } = await cashSessionRepository.sumValidatedTransactions(session.id);
    const expectedBalance = session.openingBalance + totalIn - totalOut;
    return { ...session, totalIn, totalOut, expectedBalance };
  },

  /** Ouvre une nouvelle session — une seule session ouverte à la fois par caisse. */
  async open(input: OpenCashSessionInput, openedBy: string) {
    const existing = await cashSessionRepository.findOpenForRegister(input.cashRegisterId);
    if (existing) {
      throw new ConflictError("Une session est déjà ouverte pour cette caisse. Fermez-la avant d'en ouvrir une nouvelle.");
    }
    return cashSessionRepository.create({
      openingBalance: input.openingBalance,
      openedBy,
      cashRegister: { connect: { id: input.cashRegisterId } },
    } as never);
  },

  /** Ferme la session et calcule l'écart entre solde déclaré et solde attendu. */
  async close(id: string, declaredClosingBalance: number, closedBy: string) {
    const session = await cashSessionRepository.findById(id);
    if (!session) throw new NotFoundError("Session de caisse");
    if (session.status === "CLOSED") {
      throw new ConflictError("Cette session est déjà clôturée");
    }

    const { totalIn, totalOut } = await cashSessionRepository.sumValidatedTransactions(id);
    const expectedBalance = session.openingBalance + totalIn - totalOut;
    const closed = await cashSessionRepository.close(id, closedBy, declaredClosingBalance);

    return {
      ...closed,
      expectedBalance,
      difference: Math.round((declaredClosingBalance - expectedBalance) * 100) / 100,
    };
  },

  /** Journal enrichi des paiements élèves pour une session donnée. */
  async getJournal(
    sessionId: string,
    filters: { category?: string; month?: number; year?: number; limit?: number }
  ) {
    const session = await cashSessionRepository.findByIdForJournal(sessionId);
    if (!session) throw new NotFoundError("Session de caisse");
    return cashSessionJournalRepository.listJournalPayments(
      {
        id: session.id,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        cashRegister: { schoolId: session.cashRegister.schoolId },
      },
      filters
    );
  },
};
