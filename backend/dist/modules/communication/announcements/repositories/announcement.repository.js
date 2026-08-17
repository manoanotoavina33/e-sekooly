"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.announcementRepository = {
    list(query) {
        const where = {
            schoolId: query.schoolId,
            ...(query.audience ? { OR: [{ audience: query.audience }, { audience: "ALL" }] } : {}),
        };
        return prisma_1.prisma.announcement.findMany({
            where,
            include: { author: { select: { firstName: true, lastName: true } } },
            orderBy: { publishedAt: "desc" },
        });
    },
    async findById(id) {
        return prisma_1.prisma.announcement.findUnique({
            where: { id },
            include: { author: { select: { firstName: true, lastName: true } } },
        });
    },
    create(data) {
        return prisma_1.prisma.announcement.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.announcement.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.announcement.delete({ where: { id } });
    },
};
//# sourceMappingURL=announcement.repository.js.map