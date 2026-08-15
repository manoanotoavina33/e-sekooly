"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.subjectRepository = {
    list(query, scope) {
        const where = {
            schoolId: query.schoolId,
            ...scope,
            ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
        };
        return prisma_1.prisma.subject.findMany({ where, orderBy: { name: "asc" } });
    },
    findById(id, scope) {
        return prisma_1.prisma.subject.findFirst({
            where: { id, ...scope },
            include: { teacherSubjects: { include: { employee: { include: { user: true } }, classRoom: true } } },
        });
    },
    create(data) {
        return prisma_1.prisma.subject.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.subject.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.subject.delete({ where: { id } });
    },
};
//# sourceMappingURL=subject.repository.js.map