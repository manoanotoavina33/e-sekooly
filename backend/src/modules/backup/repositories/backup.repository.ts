import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const backupRepository = {
  list(schoolId: string) {
    return prisma.backupRecord.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } });
  },

  create(data: Prisma.BackupRecordCreateInput) {
    return prisma.backupRecord.create({ data });
  },

  update(id: string, data: Prisma.BackupRecordUpdateInput) {
    return prisma.backupRecord.update({ where: { id }, data });
  },
};
