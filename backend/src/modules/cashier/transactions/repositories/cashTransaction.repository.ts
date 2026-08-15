import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListCashTransactionsQuery } from "../validations/cashTransaction.validation";

export const cashTransactionRepository = {
  list(query: ListCashTransactionsQuery) {
    const where: Prisma.CashTransactionWhereInput = {
      cashSessionId: query.cashSessionId,
      status: query.status,
    };
    return prisma.cashTransaction.findMany({
      where,
      include: { cashSession: { include: { cashRegister: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.cashTransaction.findUnique({
      where: { id },
      include: { cashSession: { include: { cashRegister: true } } },
    });
  },

  findSession(cashSessionId: string) {
    return prisma.cashSession.findUnique({ where: { id: cashSessionId } });
  },

  countByYear(year: number) {
    return prisma.cashTransaction.count({ where: { receiptNo: { startsWith: `CAI-${year}-` } } });
  },

  create(data: Prisma.CashTransactionCreateInput) {
    return prisma.cashTransaction.create({ data });
  },

  updateStatus(id: string, status: "VALIDATED" | "REJECTED", validatedBy: string) {
    return prisma.cashTransaction.update({
      where: { id },
      data: { status, validatedBy, validatedAt: new Date() },
    });
  },
};
