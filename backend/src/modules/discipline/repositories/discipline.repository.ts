import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ListDisciplineQuery } from "../validations/discipline.validation";

export const disciplineRepository = {
  list(query: ListDisciplineQuery) {
    const where: Prisma.DisciplineRecordWhereInput = {
      schoolId: query.schoolId,
      studentId: query.studentId,
      type: query.type,
    };
    return prisma.disciplineRecord.findMany({
      where,
      include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
      orderBy: { date: "desc" },
    });
  },

  create(data: Prisma.DisciplineRecordCreateInput) {
    return prisma.disciplineRecord.create({ data });
  },

  countByStudent(studentId: string) {
    return prisma.disciplineRecord.groupBy({
      by: ["type"],
      where: { studentId },
      _count: { _all: true },
    });
  },
};
