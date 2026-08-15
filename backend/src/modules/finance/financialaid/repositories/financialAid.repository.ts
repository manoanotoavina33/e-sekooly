import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListFinancialAidQuery } from "../validations/financialAid.validation";

export const financialAidRepository = {
  list(query: ListFinancialAidQuery) {
    return prisma.financialAid.findMany({
      where: { schoolId: query.schoolId, studentId: query.studentId },
      include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  listActiveForStudent(studentId: string) {
    return prisma.financialAid.findMany({ where: { studentId, isActive: true } });
  },

  create(data: Prisma.FinancialAidCreateInput) {
    return prisma.financialAid.create({ data });
  },
};
