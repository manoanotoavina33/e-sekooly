"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupRepository = void 0;
const prisma_1 = require("../../../config/prisma");
exports.backupRepository = {
    list(schoolId) {
        return prisma_1.prisma.backupRecord.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } });
    },
    create(data) {
        return prisma_1.prisma.backupRecord.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.backupRecord.update({ where: { id }, data });
    },
};
//# sourceMappingURL=backup.repository.js.map