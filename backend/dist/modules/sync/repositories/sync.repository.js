"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRepository = void 0;
const prisma_1 = require("../../../config/prisma");
exports.syncRepository = {
    logSync(data) {
        return prisma_1.prisma.syncLog.create({ data });
    },
    history(schoolId) {
        return prisma_1.prisma.syncLog.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" }, take: 50 });
    },
};
//# sourceMappingURL=sync.repository.js.map