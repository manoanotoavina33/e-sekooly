import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListExamSessionsQuery, ListExamsQuery } from "../validations/exam.validation";

export const examRepository = {
  listSessions(query: ListExamSessionsQuery) {
    return prisma.examSession.findMany({
      where: { schoolId: query.schoolId },
      orderBy: { startDate: "desc" },
      include: { _count: { select: { exams: true } } },
    });
  },

  findSessionById(id: string) {
    return prisma.examSession.findUnique({
      where: { id },
      include: { exams: { include: { subject: true, classRoom: true } } },
    });
  },

  createSession(data: Prisma.ExamSessionCreateInput) {
    return prisma.examSession.create({ data });
  },

  updateSessionDeliberation(id: string, status: "PENDING" | "VALIDATED") {
    return prisma.examSession.update({ where: { id }, data: { deliberationStatus: status } });
  },

  listExams(query: ListExamsQuery) {
    const where: Prisma.ExamWhereInput = {
      examSessionId: query.examSessionId,
      classRoomId: query.classRoomId,
    };
    return prisma.exam.findMany({
      where,
      include: {
        subject: true,
        classRoom: true,
        supervisors: { include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        _count: { select: { grades: true } },
      },
      orderBy: { date: "asc" },
    });
  },

  findExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: { subject: true, classRoom: { include: { students: true } }, examSession: true, grades: true },
    });
  },

  createExam(data: Prisma.ExamCreateInput) {
    return prisma.exam.create({ data });
  },
};
