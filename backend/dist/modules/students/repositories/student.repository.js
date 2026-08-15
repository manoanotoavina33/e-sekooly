"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentRepository = void 0;
const prisma_1 = require("../../../config/prisma");
exports.studentRepository = {
    async list(query, scope) {
        const where = {
            schoolId: query.schoolId,
            classRoomId: query.classRoomId,
            status: query.status,
            ...scope,
            ...(query.search
                ? {
                    OR: [
                        { firstName: { contains: query.search, mode: "insensitive" } },
                        { lastName: { contains: query.search, mode: "insensitive" } },
                        { registrationNo: { contains: query.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.student.findMany({
                where,
                include: { classRoom: true, user: { select: { id: true, email: true, isActive: true } } },
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            prisma_1.prisma.student.count({ where }),
        ]);
        return { items, total, page: query.page, pageSize: query.pageSize };
    },
    findById(id) {
        return prisma_1.prisma.student.findUnique({
            where: { id },
            include: {
                classRoom: true,
                user: { select: { id: true, email: true, isActive: true } },
                guardians: true,
                documents: true,
                history: { orderBy: { createdAt: "desc" } },
            },
        });
    },
    countBySchoolAndYear(schoolId, year) {
        return prisma_1.prisma.student.count({
            where: { schoolId, registrationNo: { startsWith: `ESK-${year}-` } },
        });
    },
    create(data) {
        return prisma_1.prisma.student.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.student.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.student.delete({ where: { id } });
    },
    addHistoryEvent(data) {
        return prisma_1.prisma.studentHistoryEvent.create({ data });
    },
    countBySchool(schoolId) {
        return prisma_1.prisma.student.count({ where: { schoolId, status: "ACTIVE" } });
    },
};
//# sourceMappingURL=student.repository.js.map