"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.paymentRepository = {
    list(opts) {
        const where = {};
        if (opts?.invoiceId)
            where.invoiceId = opts.invoiceId;
        if (opts?.schoolId) {
            where.invoice = { is: { schoolId: opts.schoolId } };
        }
        if (opts?.month != null && opts?.year != null) {
            const start = new Date(opts.year, opts.month - 1, 1);
            const end = new Date(opts.year, opts.month, 1);
            where.paidAt = { gte: start, lt: end };
        }
        return prisma_1.prisma.payment.findMany({
            where,
            include: { invoice: { include: { student: true, feeCategory: true } } },
            orderBy: { paidAt: "desc" },
        });
    },
    findById(id) {
        return prisma_1.prisma.payment.findUnique({
            where: { id },
            include: {
                invoice: {
                    include: {
                        student: { include: { classRoom: { select: { name: true } } } },
                        feeCategory: true,
                    },
                },
            },
        });
    },
    countBySchoolAndYear(year) {
        return prisma_1.prisma.payment.count({ where: { receiptNo: { startsWith: `REC-${year}-` } } });
    },
    create(data) {
        return prisma_1.prisma.payment.create({ data });
    },
    sumForInvoice(invoiceId) {
        return prisma_1.prisma.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } });
    },
    findInvoice(invoiceId) {
        return prisma_1.prisma.invoice.findUnique({ where: { id: invoiceId } });
    },
    /**
     * Pour chaque élève inscrit à l'école, calcule s'il a au moins un paiement
     * pour le mois/année donné, en privilégiant le mois indiqué dans la note
     * du paiement (ex: "[Mois: Septembre 2026]") plutôt que la date de paiement.
     */
    async studentPaymentStatus(schoolId, month, year) {
        const students = await prisma_1.prisma.student.findMany({
            where: { schoolId, status: "ACTIVE" },
            include: { classRoom: { select: { name: true } } },
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        });
        const payments = await prisma_1.prisma.payment.findMany({
            where: {
                invoice: { is: { schoolId } },
            },
            select: {
                invoice: { select: { studentId: true } },
                note: true,
                paidAt: true,
            },
            orderBy: { paidAt: "desc" },
        });
        const MONTH_NAMES = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        const paidStudentIds = new Set();
        for (const p of payments) {
            let coveredMonthNum = null;
            let coveredYear = null;
            const note = p.note ?? "";
            const monthMatch = note.match(/\[Mois:\s*([A-Za-zÉéû]+)\s*(\d{4})\]/);
            if (monthMatch) {
                const monthStr = monthMatch[1];
                const yearNum = parseInt(monthMatch[2], 10);
                const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
                if (monthIdx !== -1) {
                    coveredMonthNum = monthIdx + 1;
                    coveredYear = yearNum;
                }
            }
            if (coveredMonthNum === null) {
                const paidDate = new Date(p.paidAt);
                coveredMonthNum = paidDate.getMonth() + 1;
                coveredYear = paidDate.getFullYear();
            }
            if (coveredMonthNum === month && coveredYear === year) {
                paidStudentIds.add(p.invoice.studentId);
            }
        }
        return students.map((s) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            registrationNo: s.registrationNo,
            classRoom: s.classRoom ? { name: s.classRoom.name } : null,
            hasPaid: paidStudentIds.has(s.id),
        }));
    },
};
//# sourceMappingURL=payment.repository.js.map