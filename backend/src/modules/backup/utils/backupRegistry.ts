import { prisma } from "../../../config/prisma";

/**
 * Registre des modèles inclus dans une sauvegarde. Chaque entrée sait
 * comment exporter (filtré par schoolId) et réimporter ses lignes. Ajouter
 * un modèle à la sauvegarde ne demande qu'une entrée ici.
 */
export interface BackupModelDefinition {
  name: string;
  exportRows: (schoolId: string) => Promise<unknown[]>;
  importRows: (schoolId: string, rows: unknown[]) => Promise<number>;
}

export const BACKUP_MODELS: BackupModelDefinition[] = [
  {
    name: "School",
    exportRows: async (schoolId) => {
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      return school ? [school] : [];
    },
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.school.update({ where: { id: row.id }, data: row as never }).catch(() => null);
        count++;
      }
      return count;
    },
  },
  {
    name: "Student",
    exportRows: (schoolId) => prisma.student.findMany({ where: { schoolId } }),
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.student.upsert({ where: { id: row.id }, update: row as never, create: row as never });
        count++;
      }
      return count;
    },
  },
  {
    name: "Employee",
    exportRows: (schoolId) => prisma.employee.findMany({ where: { schoolId } }),
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.employee.upsert({ where: { id: row.id }, update: row as never, create: row as never });
        count++;
      }
      return count;
    },
  },
  {
    name: "ClassRoom",
    exportRows: (schoolId) => prisma.classRoom.findMany({ where: { schoolId } }),
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.classRoom.upsert({ where: { id: row.id }, update: row as never, create: row as never });
        count++;
      }
      return count;
    },
  },
  {
    name: "Invoice",
    exportRows: (schoolId) => prisma.invoice.findMany({ where: { schoolId } }),
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.invoice.upsert({ where: { id: row.id }, update: row as never, create: row as never });
        count++;
      }
      return count;
    },
  },
  {
    name: "Payment",
    exportRows: async (schoolId) => {
      const invoices = await prisma.invoice.findMany({ where: { schoolId }, select: { id: true } });
      return prisma.payment.findMany({ where: { invoiceId: { in: invoices.map((i: { id: string }) => i.id) } } });
    },
    importRows: async (_schoolId, rows) => {
      let count = 0;
      for (const row of rows as { id: string }[]) {
        await prisma.payment.upsert({ where: { id: row.id }, update: row as never, create: row as never });
        count++;
      }
      return count;
    },
  },
];
