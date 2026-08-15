import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListCashSessionsQuery } from "../validations/cashSession.validation";

export const cashSessionRepository = {
  list(query: ListCashSessionsQuery) {
    const where: Prisma.CashSessionWhereInput = {
      cashRegisterId: query.cashRegisterId,
      status: query.status,
    };
    return prisma.cashSession.findMany({
      where,
      include: { cashRegister: true, _count: { select: { transactions: true } } },
      orderBy: { openedAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.cashSession.findUnique({
      where: { id },
      include: {
        cashRegister: true,
        transactions: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  findByIdForJournal(id: string) {
    return prisma.cashSession.findUnique({
      where: { id },
      include: { cashRegister: { select: { schoolId: true } } },
    });
  },

  findOpenForRegister(cashRegisterId: string) {
    return prisma.cashSession.findFirst({ where: { cashRegisterId, status: "OPEN" } });
  },

  create(data: Prisma.CashSessionCreateInput) {
    return prisma.cashSession.create({ data });
  },

  close(id: string, closedBy: string, declaredClosingBalance: number) {
    return prisma.cashSession.update({
      where: { id },
      data: { status: "CLOSED", closedBy, closedAt: new Date(), declaredClosingBalance },
    });
  },

  /** Somme des entrées/sorties validées d'une session (base du solde attendu). */
  async sumValidatedTransactions(cashSessionId: string) {
    const [inSum, outSum] = await Promise.all([
      prisma.cashTransaction.aggregate({
        where: { cashSessionId, type: "IN", status: "VALIDATED" },
        _sum: { amount: true },
      }),
      prisma.cashTransaction.aggregate({
        where: { cashSessionId, type: "OUT", status: "VALIDATED" },
        _sum: { amount: true },
      }),
    ]);
    return { totalIn: inSum._sum.amount ?? 0, totalOut: outSum._sum.amount ?? 0 };
  },
};
