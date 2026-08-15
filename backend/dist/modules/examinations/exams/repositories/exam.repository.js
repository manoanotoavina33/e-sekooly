"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.examRepository = {
    listSessions(query) {
        return prisma_1.prisma.examSession.findMany({
            where: { schoolId: query.schoolId },
            orderBy: { startDate: "desc" },
            include: { _count: { select: { exams: true } } },
        });
    },
    findSessionById(id) {
        return prisma_1.prisma.examSession.findUnique({
            where: { id },
            include: { exams: { include: { subject: true, classRoom: true } } },
        });
    },
    createSession(data) {
        return prisma_1.prisma.examSession.create({ data });
    },
    updateSessionDeliberation(id, status) {
        return prisma_1.prisma.examSession.update({ where: { id }, data: { deliberationStatus: status } });
    },
    listExams(query) {
        const where = {
            examSessionId: query.examSessionId,
            classRoomId: query.classRoomId,
        };
        return prisma_1.prisma.exam.findMany({
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
    findExamById(id) {
        return prisma_1.prisma.exam.findUnique({
            where: { id },
            include: { subject: true, classRoom: { include: { students: true } }, examSession: true, grades: true },
        });
    },
    createExam(data) {
        return prisma_1.prisma.exam.create({ data });
    },
};
//# sourceMappingURL=exam.repository.js.map