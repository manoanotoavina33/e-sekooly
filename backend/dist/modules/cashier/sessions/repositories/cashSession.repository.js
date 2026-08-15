"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashSessionRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.cashSessionRepository = {
    list(query) {
        const where = {
            cashRegisterId: query.cashRegisterId,
            status: query.status,
        };
        return prisma_1.prisma.cashSession.findMany({
            where,
            include: { cashRegister: true, _count: { select: { transactions: true } } },
            orderBy: { openedAt: "desc" },
        });
    },
    findById(id) {
        return prisma_1.prisma.cashSession.findUnique({
            where: { id },
            include: {
                cashRegister: true,
                transactions: { orderBy: { createdAt: "desc" } },
            },
        });
    },
    findByIdForJournal(id) {
        return prisma_1.prisma.cashSession.findUnique({
            where: { id },
            include: { cashRegister: { select: { schoolId: true } } },
        });
    },
    findOpenForRegister(cashRegisterId) {
        return prisma_1.prisma.cashSession.findFirst({ where: { cashRegisterId, status: "OPEN" } });
    },
    create(data) {
        return prisma_1.prisma.cashSession.create({ data });
    },
    close(id, closedBy, declaredClosingBalance) {
        return prisma_1.prisma.cashSession.update({
            where: { id },
            data: { status: "CLOSED", closedBy, closedAt: new Date(), declaredClosingBalance },
        });
    },
    /** Somme des entrées/sorties validées d'une session (base du solde attendu). */
    async sumValidatedTransactions(cashSessionId) {
        const [inSum, outSum] = await Promise.all([
            prisma_1.prisma.cashTransaction.aggregate({
                where: { cashSessionId, type: "IN", status: "VALIDATED" },
                _sum: { amount: true },
            }),
            prisma_1.prisma.cashTransaction.aggregate({
                where: { cashSessionId, type: "OUT", status: "VALIDATED" },
                _sum: { amount: true },
            }),
        ]);
        return { totalIn: inSum._sum.amount ?? 0, totalOut: outSum._sum.amount ?? 0 };
    },
};
//# sourceMappingURL=cashSession.repository.js.map