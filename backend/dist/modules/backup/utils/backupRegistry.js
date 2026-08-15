"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKUP_MODELS = void 0;
const prisma_1 = require("../../../config/prisma");
exports.BACKUP_MODELS = [
    {
        name: "School",
        exportRows: async (schoolId) => {
            const school = await prisma_1.prisma.school.findUnique({ where: { id: schoolId } });
            return school ? [school] : [];
        },
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.school.update({ where: { id: row.id }, data: row }).catch(() => null);
                count++;
            }
            return count;
        },
    },
    {
        name: "Student",
        exportRows: (schoolId) => prisma_1.prisma.student.findMany({ where: { schoolId } }),
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.student.upsert({ where: { id: row.id }, update: row, create: row });
                count++;
            }
            return count;
        },
    },
    {
        name: "Employee",
        exportRows: (schoolId) => prisma_1.prisma.employee.findMany({ where: { schoolId } }),
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.employee.upsert({ where: { id: row.id }, update: row, create: row });
                count++;
            }
            return count;
        },
    },
    {
        name: "ClassRoom",
        exportRows: (schoolId) => prisma_1.prisma.classRoom.findMany({ where: { schoolId } }),
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.classRoom.upsert({ where: { id: row.id }, update: row, create: row });
                count++;
            }
            return count;
        },
    },
    {
        name: "Invoice",
        exportRows: (schoolId) => prisma_1.prisma.invoice.findMany({ where: { schoolId } }),
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.invoice.upsert({ where: { id: row.id }, update: row, create: row });
                count++;
            }
            return count;
        },
    },
    {
        name: "Payment",
        exportRows: async (schoolId) => {
            const invoices = await prisma_1.prisma.invoice.findMany({ where: { schoolId }, select: { id: true } });
            return prisma_1.prisma.payment.findMany({ where: { invoiceId: { in: invoices.map((i) => i.id) } } });
        },
        importRows: async (_schoolId, rows) => {
            let count = 0;
            for (const row of rows) {
                await prisma_1.prisma.payment.upsert({ where: { id: row.id }, update: row, create: row });
                count++;
            }
            return count;
        },
    },
];
//# sourceMappingURL=backupRegistry.js.map