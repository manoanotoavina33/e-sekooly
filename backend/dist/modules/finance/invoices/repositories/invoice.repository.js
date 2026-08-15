"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.invoiceRepository = {
    list(query) {
        const where = {
            schoolId: query.schoolId,
            studentId: query.studentId,
            status: query.status,
        };
        return prisma_1.prisma.invoice.findMany({
            where,
            include: {
                student: { select: { firstName: true, lastName: true, registrationNo: true } },
                feeCategory: true,
                payments: true,
            },
            orderBy: { createdAt: "desc" },
        });
    },
    findById(id) {
        return prisma_1.prisma.invoice.findUnique({
            where: { id },
            include: {
                student: { select: { firstName: true, lastName: true, registrationNo: true } },
                feeCategory: true,
                payments: { orderBy: { paidAt: "desc" } },
            },
        });
    },
    countBySchoolAndYear(schoolId, year) {
        return prisma_1.prisma.invoice.count({ where: { schoolId, invoiceNo: { startsWith: `FAC-${year}-` } } });
    },
    create(data) {
        return prisma_1.prisma.invoice.create({ data });
    },
    updateStatus(id, status) {
        return prisma_1.prisma.invoice.update({ where: { id }, data: { status } });
    },
    /** Agrège les indicateurs financiers globaux d'une école (tableau de bord). */
    async financeSummary(schoolId) {
        const invoices = await prisma_1.prisma.invoice.findMany({
            where: { schoolId },
            include: { payments: true },
        });
        let totalInvoiced = 0;
        let totalCollected = 0;
        for (const inv of invoices) {
            totalInvoiced += inv.amount - inv.discountAmount;
            totalCollected += inv.payments.reduce((sum, p) => sum + p.amount, 0);
        }
        return {
            totalInvoiced: Math.round(totalInvoiced * 100) / 100,
            totalCollected: Math.round(totalCollected * 100) / 100,
            totalOutstanding: Math.round((totalInvoiced - totalCollected) * 100) / 100,
            invoiceCount: invoices.length,
        };
    },
};
//# sourceMappingURL=invoice.repository.js.map