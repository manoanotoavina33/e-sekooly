"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplineRepository = void 0;
const prisma_1 = require("../../../config/prisma");
exports.disciplineRepository = {
    list(query) {
        const where = {
            schoolId: query.schoolId,
            studentId: query.studentId,
            type: query.type,
        };
        return prisma_1.prisma.disciplineRecord.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
            orderBy: { date: "desc" },
        });
    },
    create(data) {
        return prisma_1.prisma.disciplineRecord.create({ data });
    },
    countByStudent(studentId) {
        return prisma_1.prisma.disciplineRecord.groupBy({
            by: ["type"],
            where: { studentId },
            _count: { _all: true },
        });
    },
};
//# sourceMappingURL=discipline.repository.js.map