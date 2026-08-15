import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListInvoicesQuery } from "../validations/invoice.validation";

export const invoiceRepository = {
  list(query: ListInvoicesQuery) {
    const where: Prisma.InvoiceWhereInput = {
      schoolId: query.schoolId,
      studentId: query.studentId,
      status: query.status,
    };
    return prisma.invoice.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, registrationNo: true } },
        feeCategory: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        student: { select: { firstName: true, lastName: true, registrationNo: true } },
        feeCategory: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
    });
  },

  countBySchoolAndYear(schoolId: string, year: number) {
    return prisma.invoice.count({ where: { schoolId, invoiceNo: { startsWith: `FAC-${year}-` } } });
  },

  create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({ data });
  },

  updateStatus(id: string, status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED") {
    return prisma.invoice.update({ where: { id }, data: { status } });
  },

  /** Agrège les indicateurs financiers globaux d'une école (tableau de bord). */
  async financeSummary(schoolId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { schoolId },
      include: { payments: true },
    });
    let totalInvoiced = 0;
    let totalCollected = 0;
    for (const inv of invoices) {
      totalInvoiced += inv.amount - inv.discountAmount;
      totalCollected += inv.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
    }
    return {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalOutstanding: Math.round((totalInvoiced - totalCollected) * 100) / 100,
      invoiceCount: invoices.length,
    };
  },
};
