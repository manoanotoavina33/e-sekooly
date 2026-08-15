"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYNC_MODELS = void 0;
const prisma_1 = require("../../../config/prisma");
exports.SYNC_MODELS = [
    {
        name: "Student",
        pull: (schoolId, since) => prisma_1.prisma.student.findMany({
            where: { schoolId, updatedAt: since ? { gt: since } : undefined },
            orderBy: { updatedAt: "asc" },
        }),
        push: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                const existing = await prisma_1.prisma.student.findUnique({ where: { id: row.id } });
                // Last write wins : n'écrase que si la version poussée est plus récente.
                if (!existing || new Date(row.updatedAt) > existing.updatedAt) {
                    await prisma_1.prisma.student.upsert({
                        where: { id: row.id },
                        update: row,
                        create: row,
                    });
                    count++;
                }
            }
            return count;
        },
    },
    {
        name: "StudentAttendance",
        pull: (schoolId, since) => prisma_1.prisma.studentAttendance.findMany({
            where: { schoolId, updatedAt: since ? { gt: since } : undefined },
            orderBy: { updatedAt: "asc" },
        }),
        push: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                const existing = await prisma_1.prisma.studentAttendance.findUnique({ where: { id: row.id } });
                if (!existing || new Date(row.updatedAt) > existing.updatedAt) {
                    await prisma_1.prisma.studentAttendance.upsert({
                        where: { id: row.id },
                        update: row,
                        create: row,
                    });
                    count++;
                }
            }
            return count;
        },
    },
    {
        name: "Payment",
        pull: async (schoolId, since) => {
            const invoices = await prisma_1.prisma.invoice.findMany({ where: { schoolId }, select: { id: true } });
            return prisma_1.prisma.payment.findMany({
                where: { invoiceId: { in: invoices.map((i) => i.id) } },
                orderBy: { paidAt: "asc" },
            });
        },
        push: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.payment.upsert({
                    where: { id: row.id },
                    update: row,
                    create: row,
                });
                count++;
            }
            return count;
        },
    },
    {
        name: "CashTransaction",
        pull: (schoolId, since) => prisma_1.prisma.cashTransaction.findMany({
            where: { cashSession: { cashRegister: { schoolId } }, createdAt: since ? { gt: since } : undefined },
            orderBy: { createdAt: "asc" },
        }),
        push: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.cashTransaction.upsert({
                    where: { id: row.id },
                    update: row,
                    create: row,
                });
                count++;
            }
            return count;
        },
    },
];
//# sourceMappingURL=syncRegistry.js.map