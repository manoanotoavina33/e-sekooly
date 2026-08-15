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
    create(data) {
        return prisma_1.prisma.announcement.create({ data });
    },
};
//# sourceMappingURL=announcement.repository.js.map