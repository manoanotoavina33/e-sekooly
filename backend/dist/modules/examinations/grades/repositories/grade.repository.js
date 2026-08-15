"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.gradeRepository = {
    list(query) {
        const where = {
            examId: query.examId,
            studentId: query.studentId,
        };
        return prisma_1.prisma.grade.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
            orderBy: { createdAt: "desc" },
        });
    },
    upsert(examId, studentId, score, comment) {
        return prisma_1.prisma.grade.upsert({
            where: { examId_studentId: { examId, studentId } },
            update: { score, comment },
            create: { examId, studentId, score, comment },
        });
    },
    findExamWithSubject(examId) {
        return prisma_1.prisma.exam.findUnique({ where: { id: examId }, include: { subject: true } });
    },
};
//# sourceMappingURL=grade.repository.js.map