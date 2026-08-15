import { prisma } from "../../../config/prisma";

/**
 * Registre des modèles synchronisables entre le mode Offline (SQLite local)
 * et le Serveur (PostgreSQL). Stratégie "last write wins" basée sur
 * updatedAt : en cas de conflit, l'enregistrement le plus récent gagne.
 *
 * Foundation du Module 14 : cette liste couvre les modèles les plus
 * probables en saisie hors-ligne (élèves, présence, paiements, caisse).
 * Étendre la liste ne demande qu'une entrée supplémentaire ici.
 */
export interface SyncModelDefinition {
  name: string;
  pull: (schoolId: string, since?: Date) => Promise<{ id: string; updatedAt: Date }[]>;
  push: (schoolId: string, rows: Record<string, unknown>[]) => Promise<number>;
}

export const SYNC_MODELS: SyncModelDefinition[] = [
  {
    name: "Student",
    pull: (schoolId, since) =>
      prisma.student.findMany({
        where: { schoolId, updatedAt: since ? { gt: since } : undefined },
        orderBy: { updatedAt: "asc" },
      }),
    push: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows) {
        const existing = await prisma.student.findUnique({ where: { id: row.id as string } });
        // Last write wins : n'écrase que si la version poussée est plus récente.
        if (!existing || new Date(row.updatedAt as string) > existing.updatedAt) {
          await prisma.student.upsert({
            where: { id: row.id as string },
            update: row as never,
            create: row as never,
          });
          count++;
        }
      }
      return count;
    },
  },
  {
    name: "StudentAttendance",
    pull: (schoolId, since) =>
      prisma.studentAttendance.findMany({
        where: { schoolId, updatedAt: since ? { gt: since } : undefined },
        orderBy: { updatedAt: "asc" },
      }),
    push: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows) {
        const existing = await prisma.studentAttendance.findUnique({ where: { id: row.id as string } });
        if (!existing || new Date(row.updatedAt as string) > existing.updatedAt) {
          await prisma.studentAttendance.upsert({
            where: { id: row.id as string },
            update: row as never,
            create: row as never,
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
      const invoices = await prisma.invoice.findMany({ where: { schoolId }, select: { id: true } });
      return prisma.payment.findMany({
        where: { invoiceId: { in: invoices.map((i: { id: string }) => i.id) } },
        orderBy: { paidAt: "asc" },
      }) as never;
    },
    push: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows) {
        await prisma.payment.upsert({
          where: { id: row.id as string },
          update: row as never,
          create: row as never,
        });
        count++;
      }
      return count;
    },
  },
  {
    name: "CashTransaction",
    pull: (schoolId, since) =>
      prisma.cashTransaction.findMany({
        where: { cashSession: { cashRegister: { schoolId } }, createdAt: since ? { gt: since } : undefined },
        orderBy: { createdAt: "asc" },
      }) as never,
    push: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows) {
        await prisma.cashTransaction.upsert({
          where: { id: row.id as string },
          update: row as never,
          create: row as never,
        });
        count++;
      }
      return count;
    },
  },
];
