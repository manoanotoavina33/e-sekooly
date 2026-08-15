import { prisma } from "../../../../config/prisma";

export const reportCardRepository = {
  findSession(examSessionId: string) {
    return prisma.examSession.findUnique({ where: { id: examSessionId } });
  },

  findStudent(studentId: string) {
    return prisma.student.findUnique({
      where: { id: studentId },
      include: { classRoom: true },
    });
  },

  /**
   * Récupère toutes les notes de tous les élèves d'une classe pour une
   * session d'examens donnée, avec la matière et le barème de chaque
   * épreuve — base de calcul pour la moyenne pondérée et le classement.
   */
  findClassGradesForSession(examSessionId: string, classRoomId: string) {
    return prisma.grade.findMany({
      where: { exam: { examSessionId, classRoomId } },
      include: {
        exam: { include: { subject: true } },
        student: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
      },
    });
  },
};
