"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashTransactionRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.cashTransactionRepository = {
    list(query) {
        const where = {
            cashSessionId: query.cashSessionId,
            status: query.status,
        };
        return prisma_1.prisma.cashTransaction.findMany({
            where,
            include: { cashSession: { include: { cashRegister: true } } },
            orderBy: { createdAt: "desc" },
        });
    },
    findById(id) {
        return prisma_1.prisma.cashTransaction.findUnique({
            where: { id },
            include: { cashSession: { include: { cashRegister: true } } },
        });
    },
    findSession(cashSessionId) {
        return prisma_1.prisma.cashSession.findUnique({ where: { id: cashSessionId } });
    },
    countByYear(year) {
        return prisma_1.prisma.cashTransaction.count({ where: { receiptNo: { startsWith: `CAI-${year}-` } } });
    },
    create(data) {
        return prisma_1.prisma.cashTransaction.create({ data });
    },
    updateStatus(id, status, validatedBy) {
        return prisma_1.prisma.cashTransaction.update({
            where: { id },
            data: { status, validatedBy, validatedAt: new Date() },
        });
    },
};
//# sourceMappingURL=cashTransaction.repository.js.map