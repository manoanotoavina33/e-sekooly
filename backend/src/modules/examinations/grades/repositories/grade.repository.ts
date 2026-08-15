import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListGradesQuery } from "../validations/grade.validation";

export const gradeRepository = {
  list(query: ListGradesQuery) {
    const where: Prisma.GradeWhereInput = {
      examId: query.examId,
      studentId: query.studentId,
    };
    return prisma.grade.findMany({
      where,
      include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  upsert(examId: string, studentId: string, score: number, comment?: string) {
    return prisma.grade.upsert({
      where: { examId_studentId: { examId, studentId } },
      update: { score, comment },
      create: { examId, studentId, score, comment },
    });
  },

  findExamWithSubject(examId: string) {
    return prisma.exam.findUnique({ where: { id: examId }, include: { subject: true } });
  },
};
