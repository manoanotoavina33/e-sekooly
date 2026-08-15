import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListCashRegistersQuery } from "../validations/cashRegister.validation";

export const cashRegisterRepository = {
  list(query: ListCashRegistersQuery) {
    return prisma.cashRegister.findMany({ where: { schoolId: query.schoolId }, orderBy: { name: "asc" } });
  },

  findOpenSession(cashRegisterId: string) {
    return prisma.cashSession.findFirst({ where: { cashRegisterId, status: "OPEN" } });
  },

  create(data: Prisma.CashRegisterCreateInput) {
    return prisma.cashRegister.create({ data });
  },

  async findOrCreateDefault(schoolId: string) {
    const registers = await prisma.cashRegister.findMany({ where: { schoolId }, orderBy: { name: "asc" } });
    if (registers.length > 0) return registers;
    const newReg = await prisma.cashRegister.create({
      data: { schoolId, name: "Caisse Principale", location: "Accueil / Secrétariat" }
    });
    return [newReg];
  },
};
