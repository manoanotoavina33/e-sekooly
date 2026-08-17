"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCardRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.reportCardRepository = {
    findSession(examSessionId) {
        return prisma_1.prisma.examSession.findUnique({ where: { id: examSessionId } });
    },
    findStudent(studentId) {
        return prisma_1.prisma.student.findUnique({
            where: { id: studentId },
            include: { classRoom: true },
        });
    },
    findSemester(semesterId) {
        if (!semesterId)
            return Promise.resolve(null);
        return prisma_1.prisma.semester.findUnique({ where: { id: semesterId } });
    },
    /**
     * Récupère toutes les notes de tous les élèves d'une classe pour une
     * session d'examens donnée, avec la matière et le barème de chaque
     * épreuve — base de calcul pour la moyenne pondérée et le classement.
     */
    findClassGradesForSession(examSessionId, classRoomId) {
        return prisma_1.prisma.grade.findMany({
            where: { exam: { examSessionId, classRoomId } },
            include: {
                exam: { include: { subject: true } },
                student: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
            },
        });
    },
};
//# sourceMappingURL=reportcard.repository.js.map