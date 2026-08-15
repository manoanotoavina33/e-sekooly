"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAidRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.financialAidRepository = {
    list(query) {
        return prisma_1.prisma.financialAid.findMany({
            where: { schoolId: query.schoolId, studentId: query.studentId },
            include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
            orderBy: { createdAt: "desc" },
        });
    },
    listActiveForStudent(studentId) {
        return prisma_1.prisma.financialAid.findMany({ where: { studentId, isActive: true } });
    },
    create(data) {
        return prisma_1.prisma.financialAid.create({ data });
    },
};
//# sourceMappingURL=financialAid.repository.js.map